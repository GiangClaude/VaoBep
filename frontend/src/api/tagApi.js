import apiClient from "./index";

const tagApi = {
    getAllTags: async () => {
        const response = await apiClient.get('/tags');
        return response;
    }
};

export default tagApi;