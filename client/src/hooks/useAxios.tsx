import { useContext, useEffect, useState } from "react";
import axiosInstance from "../utils/AxiosSetup";
import AuthContext from "../context/AuthContext";
import { AxiosInstance } from "axios";
import { AuthTokens } from "../types/types";

const useAxios = () => {
	const contextData = useContext(AuthContext);

	const axios = axiosInstance as AxiosInstance;

	useEffect(() => {
		const authTokensLocal = localStorage.getItem("authTokens");
		const authTokens: AuthTokens = authTokensLocal ? JSON.parse(authTokensLocal) : null;

		const requestIntercept = axios.interceptors.request.use(
			(config) => {
				if (!config.headers["Authorization"] && authTokens?.access) {
					config.headers["Authorization"] = `Bearer ${authTokens?.access}`;
				}
				return config;
			},
			(error) => Promise.reject(error)
		);

		const responseIntercept = axios.interceptors.response.use(
			(response) => response,
			async (error) => {
				if (error?.response?.status === 401) {
					contextData?.logoutUser();
				}

				return Promise.reject(error);
			}
		);

		return () => {
			axios.interceptors.request.eject(requestIntercept);
			axios.interceptors.response.eject(responseIntercept);
		};
	}, [contextData]);

	return axios;
};

export default useAxios;