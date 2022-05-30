# temporary databse

import bcrypt
import secrets
import os, pickle
# userId : userData

USERS_PATH = "db/userdata.pkl"

class User():
	"""
	User Class

	Attributes
	----------
	username: str
		username of the user

	email: str
		email id of the user

	password: str hashed
		hash of the password of user

	"""
	def __init__(self, username, email, password, gamesLiked={}):
		self.username = username
		self.email = email
		self.password = password
		self.gamesLiked = gamesLiked

		self._id = secrets.token_hex()

	def __repr__(self):
		return f"User({self.username}, {self.email})"


def loadUsers(USERS_PATH):
	try:
		with open(USERS_PATH, 'rb') as inp:
			users = pickle.load(inp)
		return users
	except:
		return {}

def loadPriority(PRIORITY_PATH):
	try:
		with open(PRIORITY_PATH, 'rb') as inp:
			priority = pickle.load(inp)
		return priority
	except:
		return {}


def saveUsers(USERS_PATH=USERS_PATH):
	with open(USERS_PATH, 'wb') as file:
		pickle.dump(users, file)
	return True

def insertOne(username, email, password, USERS_PATH=USERS_PATH):
	# Hash password
	mySalt = bcrypt.gensalt()
	hashedPassword = bcrypt.hashpw(password.encode('utf-8'), mySalt)

	user = User(username, email, hashedPassword.decode('utf-8'))
	users[user.email] = user

	saveUsers(USERS_PATH)
	return user

def deleteOne(email):
	del users[email]
	return None


def alreadyExist(email):
	return email in users


def checkCredentials(email, password):
	if email in users:
		if bcrypt.checkpw(password.encode('utf-8'), users[email].password.encode('utf-8')):
			return users[email]
		else:
			return None
	else:
		return None


def addGameToLiked(appid, email, level=1):
	users[email].gamesLiked[appid] = level


def increasePriority(appid):
	priority[appid] = prority.get(appid, 0) + 1
	return priority[appid]


users = loadUsers(USERS_PATH)

if __name__ == '__main__':
	# insertOne('john', 'john@gmail.com', '123456')
	# print(users)
	# print(alreadyExist('john@gmail.com'))
	# print(users['john@gmail.com'].password)
	# print(checkCredentials('john@gmail.com', '123456'))
	pass