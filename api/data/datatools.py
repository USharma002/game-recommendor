import os
import pandas as pd
import numpy as np
import requests
import pickle
import nltk

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from collections import Counter

def cleanhtml(raw_html):
  cleantext = re.sub(CLEANR, '', raw_html)
  return cleantext


def getGameFromSteam(appid):
	response = requests.get(rf"https://store.steampowered.com/api/appdetails?appids={appid}")

	if response and "data" in response.json()[f"{appid}"]:
		return response.json()[f"{appid}"]["data"]
	else:
		return None


def loadObject(PATH):
	with open(PATH, 'rb') as inp:
		new_game = pickle.load(inp)
	return new_game


def saveObject(obj, USERS_PATH):
	with open(USERS_PATH, 'wb') as file:
		pickle.dump(obj, file, pickle.HIGHEST_PROTOCOL)
	return True


def initializeDataset(PATH):
	try:
		dataset = pd.read_csv(PATH)
	except:
		with ZipFile('dataset.zip', 'r') as zip_ref:
			zip_ref.extractall('')
		dataset = pd.read_csv(PATH)
	dataset.dropna(inplace=True, subset=['game_description', 'name', 'genre', 'popular_tags', 'developer', 'publisher'])
	

	# splittig the genre string to create a list of genre
	pop_tags_col_index = np.where(dataset.columns.values == "popular_tags")[0][0]

	dataset["genre"] = dataset.genre.str.split(',')
	dataset["popular_tags"] = dataset.popular_tags.str.split(',')

	if 'priority' not in dataset.columns:
		dataset["priority"] = 0
	
	# extracting percentage of positive review from dataset
	dataset["positive_review_percentage"] = dataset.all_reviews.str.extract(r'(\d+(?=%))')

	# extracting total number of reviews from dataset
	dataset["review_count"] = dataset.all_reviews.str.replace(",", "")
	dataset["review_count"] = dataset.review_count.str.extract(r'(\d+(?=))').replace(np.NaN, 0)
	dataset["review_count"] = dataset.review_count.astype(int)

	dataset = dataset[dataset.review_count > 300]

	# Extracting appid from dataset
	dataset["appid"] = dataset.url.str.extract(r'(\d+(?=/))')
	dataset.dropna(inplace=True, subset=["appid"])

	dataset["appid"] = dataset["appid"].astype(int)
	dataset["steam_appid"] = dataset["appid"].astype(int)

	dataset["positive_review_count"] = dataset.all_reviews.str.extract(r'(\d+(?=))')

	dataset = dataset.drop_duplicates(subset=['steam_appid'])
	dataset.set_index('appid', inplace=True)

	saveObject(dataset, 'dataset.pkl')
	return dataset


def loadDataset(PATH, DATASET_FILE='steam_games.csv'):
	try:
		with open(PATH, 'rb') as inp:
			dataset = pickle.load(inp)
		print("[ Processed Dataset Found ! Loading dataset ]")
		return dataset
	except:
		print("[ !! Processed Dataset NOT found !! ]")
		return initializeDataset(DATASET_FILE)


def countCategory(dataset, col):
	tags = dataset.dropna(subset=[col]) # dropping all games with where tags is na
	tags = [j for sub in tags[col].values for j in sub]
	tags = Counter(tags) # generating a counter of all tags

	return tags


def allCharsInString(string, chars):
	curr = 0
	for char in string:
		if curr == len(chars):
			return True
		if char == chars[curr]:
			curr += 1
	return curr == len(chars)


def hasTags(arr, tags):
	if type(arr) == float:
		return False

	for tag in tags:
		if tag not in arr:
			return False
	return True


def excludeTags(arr, tags):
	for tag in tags:
		if hasTags(arr, [tag]):
			return False
	return True


def searchGameByName(dataset, name):
	resultBySubstr = np.vectorize(lambda x: name.lower() in x.lower())(dataset["name"].dropna().values)
	resultByAllChar = np.vectorize(lambda x: allCharsInString(x.lower(), name.lower()))(dataset["name"].dropna().values)

	data = dataset[dataset["name"].isna()==False]

	topResults = data[resultBySubstr].sort_values(by=['priority', 'positive_review_percentage', 'review_count'], ascending=False)
	lastResults =data[resultByAllChar].sort_values(by=['priority', 'positive_review_percentage', 'review_count'], ascending=False)

	return pd.concat([topResults, lastResults])


def searchGameByTagAndName(dataset, tags, name, exclusions=[]):
	if tags==[] and name == '' and exclusions==[]:
		return dataset.sort_values(by=['priority', 'review_count', 'positive_review_percentage'], ascending=False)

	data = searchGameByName(dataset, name)

	filterTagsFunc = np.vectorize(lambda x: hasTags(x, tags) and excludeTags(x, exclusions))

	# resultByGenre = filterTagsFunc(data["genre"].values)
	# resultByPopularTag = filterTagsFunc(data["popular_tags"].values)

	# topResults = data[resultByPopularTag]
	# lastResults = data[resultByGenre]

	# result = pd.concat([topResults, lastResults]).drop_duplicates(subset=['name'])

	result = data[filterTagsFunc(data["popular_tags"].values)].drop_duplicates(subset='name')

	return result.sort_values(by=["priority"], ascending=[False])


def getLikedGames(dataset, user):
	return dataset[dataset.steam_appid.isin( user.gamesLiked.keys() )]


def searchGameByDeveloper(dataset, developer):
	resultBySubstr = np.vectorize(lambda x: developer.lower() in x.lower())(dataset["developer"].dropna().values)
	resultByAllChar = np.vectorize(lambda x: allCharsInString(x.lower(), developer.lower()))(dataset["developer"].dropna().values)
	data = dataset[dataset["developer"].isna()==False]

	return pd.concat([data[resultBySubstr], data[resultByAllChar]])	


def getSimilarGames(dataset, similarity_matrix, new_games, appid, count):
    index = new_games[new_games.name == dataset.name[appid]].index[0]
    distances = similarity_matrix[index]
    similar_games = sorted( list(enumerate(distances)) ,reverse = True,key = lambda x : x[1])[1:count]

    result = dataset.loc[new_games.iloc[ list(map(lambda x: x[0], similar_games)) ]['steam_appid'].astype(int)]
    return result

def getSimilarGamesByList(dataset, similarity_matrix, new_games, arr, count):
	res = []
	for appid in arr:
		index = new_games[new_games.name == dataset.name[appid]].index[0]
		distances = similarity_matrix[index]
		similar_games = sorted( list(enumerate(distances)) ,reverse = True,key = lambda x : x[1])[1:count]
		res.extend(similar_games)

	res = sorted( res ,reverse = True,key = lambda x : x[1])
	result = dataset.loc[new_games.iloc[ list(map(lambda x: x[0], res)) ]['steam_appid'].astype(int)]
	return result


def createSimilarityMatrix(new_games):
	try:
		similarity = loadObject("data/similarity.pkl")
		print("[ similarity matrix found! ]")

	except (OSError, IOError) as e:

		print("[ !!similarity matrix not found!! creating now ] ")

		cv = CountVectorizer(max_features = 5000, stop_words = 'english')
		vectors = cv.fit_transform(new_games.tags).toarray()
		similarity = cosine_similarity(vectors)

		pickle.dump(similarity,open('data/similarity.pkl','wb'), protocol=4)

	print("[ Similarity matrix loaded ]")
	return similarity


new_games = loadObject("data/new_games.pkl")
similarity_matrix = createSimilarityMatrix(new_games)

print("[ Recommendation system loaded! ]")

if __name__ == "__main__":
	dataset = loadDataset("dataset.pkl")
	print(dataset.head().name)
	# print(getSimilarGamesByList(dataset, similarity_matrix, new_games, [379720, 578080],10).name)