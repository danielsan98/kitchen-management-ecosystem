
import { Logger } from '@nestjs/common';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import * as http from 'http';
import * as https from 'https';

const logger = new Logger('AsyncApi');

export const getAsycApi = (url: string, params: any, callback: Function) => {
  const { playerUser, playerPass, branch } = params || {};

  const config: AxiosRequestConfig = {
    method: 'get',
    url,
    timeout: 30000,
    headers: {
      'Connection': 'close'
    },
    responseType: 'stream',
    httpAgent: new http.Agent({ keepAlive: false }),
    httpsAgent: new https.Agent({ keepAlive: false })
  };

  if (playerUser && playerPass) {
    config.headers!['Authorization'] = `Basic ${Buffer.from(`${playerUser}:${playerPass}`).toString('base64')}`;
  }

  axios.request(config)
    .then((response) => {
      const chunks: Buffer[] = [];
      response.data.on('data', (chunk: Buffer) => chunks.push(chunk));
      response.data.on('end', () => {
        const rawData = Buffer.concat(chunks).toString('utf8');
        callback(rawData, branch);
      });
      response.data.on('error', (err: Error) => {
        logger.error(`Stream error: ${err.message}`);
      });
    })
    .catch((error: AxiosError) => {
      if (error.response) {
        logger.error(`Server error: ${error.response.status} ${error.response.statusText}`);
      } else {
        logger.error(`Network error: ${error.message}`);
      }
    });
};