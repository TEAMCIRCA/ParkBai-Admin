import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getDatabase, ref, child, onValue, get, update, set, remove } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import { getStorage, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";


const uid = sessionStorage.getItem("uid");
const platenumberID = sessionStorage.getItem("platenumber");


const firebaseConfig = {
    apiKey: "AIzaSyBrmIkzH9xI9BHHSJOJMYDd-J3UkPJsS7k",
    authDomain: "parkbai-c8f04.firebaseapp.com",
    databaseURL: "https://parkbai-c8f04-default-rtdb.firebaseio.com",
    projectId: "parkbai-c8f04",
    storageBucket: "parkbai-c8f04.appspot.com",
    messagingSenderId: "195961929914",
    appId: "1:195961929914:web:f609827668b79399b80283",
    measurementId: "G-0THPRYGBY6"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);
var email;

//FETCHING VEHICLE DETAILS
const dbRef = ref(db, 'DRIVER/' + uid + '/VEHICLE/' + platenumberID);
get(dbRef).then((snapshot) => {
    if (snapshot.exists()) {
        var vehicleData = snapshot.val();
        // console.log(vehicleData);    
        document.getElementById("txt_app").value = vehicleData.vehicle_app;
        document.getElementById("txt_brand").value = vehicleData.brand;
        document.getElementById("txt_model").value = vehicleData.model;
        document.getElementById("txt_color").value = vehicleData.color;
        document.getElementById("txt_type").value = vehicleData.type;

    }
    else {
        console.log("error");
    }
});


//FETCHING DRIVER DETAILS
const driverRef = ref(db, 'DRIVER/' + uid + '/ACCOUNT');
get(driverRef).then((snapshot) => {
    if (snapshot.exists()) {
        var driverData = snapshot.val();
        //console.log(driverData);
        document.getElementById("txt_name").value = driverData.lastname + ", " + driverData.firstname + " " + driverData.middlename + " ";
        document.getElementById("txt_add").value = driverData.address;
        document.getElementById("txt_email").value = driverData.email;
        document.getElementById("txt_phone").value = driverData.phonenumber;
        document.getElementById("txt_bal").value = "₱ " + driverData.balance.toFixed(2);

        email = driverData.email;
    }
    else {
        console.log("error");
    }
});



document.getElementById("btn_cor").addEventListener('click', function () {
    openFileFromVehicle('vehicleDocument');
    console.log("cor");

});

document.getElementById('btn_vehicle').addEventListener('click', function () {
    openFileFromVehicle('vehicleImage');
    console.log("vehicle");
});


function openFileFromVehicle(fileType) {
    /*console.log(uid , platenumberID, fileType);*/
    const fileRef = ref(db, '/DRIVER/' + uid + '/VEHICLE/' + platenumberID + "/" + fileType);
    get(fileRef).then((snapshot) => {
        if (snapshot.exists()) {
            const filePath = snapshot.val();
            /*const storageReference = storageRef(storage, filePath);*/
            /*openFileInNewTab(filePath);*/
            /* console.log(filePath);*/
            window.open(filePath, '_blank');
        }
        else {
            console.error('File path not found in the database.');
        }
    }).catch((error) => {
        console.error('Error fetching file path from the database', error);
    });
}



document.getElementById("btn_license").addEventListener('click', function () {
    openFileFromDriver('imageDLUrl');
    console.log("license");

});

document.getElementById('btn_pic').addEventListener('click', function () {
    openFileFromDriver('imageUrl');
    console.log("picture");
});


function openFileFromDriver(fileType) {
    /*console.log(uid, platenumberID, fileType);*/
    const fileRef = ref(db, '/DRIVER/' + uid + '/ACCOUNT/' + fileType);
    get(fileRef).then((snapshot) => {
        if (snapshot.exists()) {
            const filePath = snapshot.val();
            /*const storageReference = storageRef(storage, filePath);*/
            /*openFileInNewTab(filePath);*/
            /*console.log(filePath);*/
            window.open(filePath, '_blank');
        }
        else {
            console.error('File path not found in the database.');
        }
    }).catch((error) => {
        console.error('Error fetching file path from the database', error);
    });
}


