import S3 from "aws-sdk/clients/s3";

// import dotenv from "dotenv";
// dotenv.config();

// const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
// const SECRET_ACCESS_KEY_ID = process.env.AWS_SECRET_ACCESS_KEY_ID;

//generating UUID-------------------
function userIdGenerator(username, digits) {
    const availableChars = "1234567890ABCDEFGHIJKLMNOPQR";
    const shuffeldUsername = fisherShuffle(username);
    const dateStamp = Date.now().toString().slice(-4);
    const userID = fisherShuffle(availableChars + dateStamp + shuffeldUsername);
    let result = "";

    for (let i = 0; i < digits; i++) {
        const randomNum = Math.floor(Math.random() * availableChars.length);
        result += userID[randomNum];
    }

    return result;
}
function fisherShuffle(username) {
    const arr = username.toString().split("");
    for (let x = 0; x < arr.length; x++) {
        let j = Math.floor(Math.random() * x); //random place in the array
        let k = arr[x]; // current original char in arr
        arr[x] = arr[j]; // change the original to the random one from array
        arr[j] = k; //change the random one we have in array to the current place.
        //its all about exchanging the places
    }
    return arr.join("");
}
//generating UUID-------------------end

export const uploadFile = (file, folderName) => {
    const s3 = new S3({
        region: "eu-north-1",
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY_ID,
        signatureVersion: "v4",
    });

    let uuid = userIdGenerator(file.name, 50);

    s3.upload(
        {
            Bucket: "aws-uppgift-war-kittens",
            Key: (folderName ? folderName + "/" : "") + uuid + file.name,
            Body: file,
        },
        (err, data) => {
            if (err) {
                console.log(err);
            } else {
                console.log(data);
            }
        }
    );
};

export const createFolder = (folderName) => {
    const s3 = new S3({
        region: "eu-north-1",
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY_ID,
        signatureVersion: "v4",
    });

    s3.upload(
        {
            Bucket: "aws-uppgift-war-kittens",
            // Key: (folderName ? folderName + "/" : "") + uuid + file.name,
            Key: folderName + "/",
            Body: "",
        },
        (err, data) => {
            if (err) {
                console.log(err);
            } else {
                console.log(data);
            }
        }
    );
};
