import { v4 as uuidv4 } from 'uuid';

export const handler = (event: any) => {

    console.log(event);

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: uuidv4()
        })
    }
}