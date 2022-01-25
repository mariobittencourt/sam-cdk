export const handler = (event: any) => {

    console.log(event);

    return {
        'statusCode': 200,
        'body': "Success"
    };
}