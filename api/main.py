import json, sys

from data import datatools as dt
from db import database as db

import flask
from flask import Flask,abort
from flask_cors import CORS, cross_origin

DATASET_FILE = r"data/steam_games.csv"
PATH = r"data/dataset.pkl"

dataset = dt.loadDataset(PATH, DATASET_FILE=DATASET_FILE)
print(db.users)
tags = dt.countCategory(dataset, 'popular_tags')

sortSelection = {
	0: "priority",
	1: "positive_review_percentage",
	2: "review_count"
}

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*", "allow_headers": "*", "expose_headers": "*"}})
app.config['CORS_HEADERS'] = 'Content-Type'


@app.route("/search/", methods=["POST", "OPTIONS"])
@cross_origin(origin='*',headers=['Content- Type','Authorization'])
def searchGame():
	# getting the parameters from the request
	req = flask.request.json
	if "count" not in req:
		req["count"] = 10

	
	res = dt.searchGameByTagAndName(dataset=dataset, tags=req["tags"], name=req["name"], exclusions=req["exclusions"])

	ascending = req["ascending"]

	res = res.sort_values(by=[ sortSelection[req["sortBy"]], 'review_count', 'positive_review_percentage' ], ascending=[ascending]*3)
	print(res.head().priority, file=sys.stderr)

	startIndex = (req["page"]-1) * req["count"]
	endIndex = startIndex + req["count"]

	return res[startIndex:endIndex].to_json(orient='records')


@app.route("/home/", methods=["POST", "OPTIONS"])
@cross_origin(origin='*',headers=['Content- Type','Authorization'])
def home():
	# getting the parameters from the request
	req = flask.request.json
	if "count" not in req:
		req["count"] = 10

	user = req["user"]
	ascending = req["ascending"]

	print(req, file=sys.stderr)

	if user and db.users[user["email"]].gamesLiked:
		res = dt.getSimilarGamesByList(dataset, dt.similarity_matrix, dt.new_games, db.users[user["email"]].gamesLiked, req["count"] + 1).drop_duplicates(subset=["steam_appid"])
	else:
		res = dt.searchGameByTagAndName(dataset, req["tags"], req["name"], req["exclusions"])
		res = res.sort_values(by=[ sortSelection[req["sortBy"]], 'review_count', 'positive_review_percentage' ], ascending=[ascending]*3)

	startIndex = (req["page"]-1) * req["count"]
	endIndex = startIndex + req["count"]

	return res[startIndex:endIndex].to_json(orient='records')


@app.route('/genre/')
def getGenre():
	response = json.dumps(tags)
	return response


@app.route('/suggestions/', methods=["POST", "OPTIONS"])
@cross_origin(origin='*',headers=['Content- Type','Authorization'])
def suggestions():
	req = flask.request.json
	name = req["name"]

	response = dt.searchGameByName(dataset, name).head(5)
	return response.to_json(orient='records')


@app.route("/game/", methods=["POST", "OPTIONS"])
@cross_origin(origin='*',headers=['Content- Type','Authorization'])
def game():
	req = flask.request.json
	appid = req["appid"]
	
	response = dt.getGameFromSteam(appid)
	if response:
		return response
	else:
		abort(500)


@app.route("/login/", methods=["POST", "OPTIONS"])
@cross_origin(origin='*',headers=['Content- Type','Authorization'])
def login():
	req = flask.request.json
	email = req["email"]
	password = req["password"]
	
	user = db.checkCredentials(email, password)
	print(db.users, file=sys.stderr)

	if user:
		response = json.dumps(user.__dict__)
	else:
		abort(500)
	return response

@app.route("/signup/", methods=["POST", "OPTIONS"])
@cross_origin(origin='*',headers=['Content- Type','Authorization'])
def signup():
	req = flask.request.json

	email = req["email"]
	password = req["password"]
	username = req["username"]
	
	existence = db.alreadyExist(email)
	if existence:
		abort(500)
	else:
		user = db.insertOne(username, email, password)
		response = json.dumps(user.__dict__)

	return response

@app.route("/priority/", methods=["POST", "OPTIONS"])
@cross_origin(origin='*', headers=['Content- Type','Authorization'])
def priority():
	req = flask.request.json
	appid = int(req["appid"])

	# will change priority inplcae and return new priority
	dataset.at[appid , "priority"] = dataset["priority"][appid] + 1

	dt.saveObject(dataset, PATH)
	return {"appid": appid}


@app.route("/like/", methods=["POST", "OPTIONS"])
@cross_origin(origin='*', headers=['Content- Type','Authorization'])
def like():
	req = flask.request.json
	appid = int(req["appid"])
	email = req["email"]

	# will change priority inplcae and return new priority
	if appid not in db.users[email].gamesLiked:
		db.addGameToLiked(appid, email, level=1)
	else:
		del db.users[email].gamesLiked[appid]

	db.saveUsers()

	return "Liked it", 200


@app.route("/likedgames/", methods=["POST", "OPTIONS"])
@cross_origin(origin='*', headers=['Content- Type','Authorization'])
def getLikedGames():
	req = flask.request.json
	email = req["email"]

	response = dt.getLikedGames(dataset, db.users[email])
	
	return response.to_json(orient='records'), 200


@app.route('/recommend/', methods=["POST", "OPTIONS"])
@cross_origin(origin='*',headers=['Content- Type','Authorization'])
def recommend():
	req = flask.request.json
	print(req, file=sys.stderr)
	appid = req["appid"]
	user = req["user"]
	count = req["count"]

	response = dt.getSimilarGames(dataset, dt.similarity_matrix, dt.new_games, appid, count + 1)
	print(response.shape, file=sys.stderr)
	return response.to_json(orient='records')


@app.errorhandler(500)
def internal_error(error):
    return error, 500

if __name__ == '__main__':
	app.run(debug=True)