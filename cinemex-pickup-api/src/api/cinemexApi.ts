
import { Logger } from '@nestjs/common';
import axios from 'axios';

const logger = new Logger('GetApi');

export const getApi = async (url: string, params: any) => {
    try {

        const { playerUser, playerPass, ...restParams } = params;

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url,
            headers: {}
        };

        if (playerUser && playerPass && playerUser !== '' && playerPass !== '') {
            config.headers['Authorization'] = `Basic ${Buffer.from(`${playerUser}:${playerPass}`).toString('base64')}`;
        }

        const response = await axios(config);

        return response.data
    } catch (error) {
        logger.error(error.message);
        logger.error(error);
        throw error;
    }
}