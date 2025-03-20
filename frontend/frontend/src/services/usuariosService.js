import api from '../api/axiosConfig';

export const getUsuarios = async () => {
    const response = await api.get('/usuarios/');
    return response.data;
};
