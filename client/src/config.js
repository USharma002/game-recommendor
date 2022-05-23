import axios from "axios";

export const axiosInstance = axios.create({
	baseURL : "https://game-recommender-api.herokuapp.com/"
})