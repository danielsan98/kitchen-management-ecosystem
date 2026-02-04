// itemUtils.ts

import { patchApi } from "../../../api/cinemex.api.js";
import cinemexUrls from "../../../api/cinemexUrls.js";


// export const updateItemCompletedQuantity = async (transId: number, completedQuantity: number, token: string) => {
    
//     // Los datos ahora se envían en el cuerpo JSON, que patchApi maneja
//     const dataToSend = {
//         transId,
//         completedQuantity
//     };

//     const response = await patchApi(
//         cinemexUrls.updateItemCompletedQuantity, 
//         token, 
//         dataToSend
//     );
    
    
//     if (response && response.statusCode && response.statusCode >= 400) {
//         throw new Error(response.message || "Error al actualizar la cantidad de items completados.");
//     }
    
//     return response;
// };

export const updateItemCompletedQuantity = async (transId: number, completedQuantity: number, token: string) => {
    
    const dataToSend = {
        transId, 
        completedQuantity
    };

    const response = await patchApi(
        cinemexUrls.updateItemCompletedQuantity, 
        token, 
        dataToSend
    );
    
    // ⚠️ AÑADIR ESTE LOG para ver la respuesta del servidor
    console.log('Respuesta de la API PATCH:', response);
    
    if (response && response.statusCode && response.statusCode >= 400) {
        // ... (el código ya existente)
        console.error("Fallo del servidor:", response.message, "Status:", response.statusCode);
        throw new Error(response.message || "Error al actualizar la cantidad de items completados.");
    }
    
    return response;
};

