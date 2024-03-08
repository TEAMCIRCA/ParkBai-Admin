import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getDatabase, get, ref ,update, set, push} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
import { getStorage, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-storage.js";

$(document).ready(function () {



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
    const auth = getAuth(app);


    //PARKBAI ICON FETCHING
    const imgRef = ref(db, '/ADMIN/ASSETS/Icon');
    get(imgRef).then((snapshot) => {
        if (snapshot.exists()) {
            const imgElement = document.getElementById('ParkBaiIcon');
            imgElement.src = snapshot.val();
        }
        else {
            console.error('File path not found in database.');
        }
    }).catch((error) => {
        console.error('Error fetching file', error);
    });
    

    //FETCH PARKBAI BALANCE
    async function parkbaiBal() {
        const balPBRef = ref(db, 'ADMIN/parkbai_balance');
        try {
            const snapshot = await get(balPBRef);
            if (snapshot.exists()) {
                var pb = snapshot.val();
                return pb;
            } else {
                console.error('File path not found in database.');
            }
        } catch (error) {
            console.error('Error fetching parkbai balance:', error);
        }
    }

    //FETCH DRIVER BALANCES
    async function fetchDriverBalances() {
        const driverRef = ref(db, 'DRIVER');

        try {
            const snapshot = await get(driverRef);
            const driverUIDs = [];

            snapshot.forEach((childSnapshot) => {
                const childId = childSnapshot.key;
                driverUIDs.push(childId);
            });

            const driverBalances = await Promise.all(driverUIDs.map(getDriver));
            const totalDriverBal = driverBalances.reduce((acc, bal) => acc + bal, 0);
            return totalDriverBal;
        } catch (error) {
            console.error('Error fetching driver balances:', error);
        }
    }

    //FETCH OWNER BALANCES
    async function fetchOwnerBalances() {
        const ownerRef = ref(db, 'PARK_OWNER');

        try {
            const snapshot = await get(ownerRef);
            const OwnerUID = [];

            snapshot.forEach((childSnapshot) => {
                const childId = childSnapshot.key;
                OwnerUID.push(childId);
            });

            const ownerBalances = await Promise.all(OwnerUID.map(getOwner));
            const totalOwnerBal = ownerBalances.reduce((acc, bal) => acc + bal, 0);
            return totalOwnerBal;
        } catch (error) {
            console.error('Error fetching owner balances:', error);
        }
    }

    //FETCH GENERAL BALANCE
    async function generalBal() {
        const genRef = ref(db, 'ADMIN/general_balance');
        try {
            const snapshot = await get(genRef);
            if (snapshot.exists()) {
                var genbal = snapshot.val();
                return genbal;
            } else {
                console.error('File path not found in database.');
            }
        } catch (error) {
            console.error('Error fetching parkbai balance:', error);
        }
    }

    //MAIN CODE
    async function fetchData() {

        //parkbai
        var parkBai = await parkbaiBal();
        var adminData = parkBai.toFixed(2);
        var bal = numberWithSpaces(adminData);
        document.getElementById('parkBaiBal').value = "₱ " + bal;
        //console.log(parkBai);

        //driver
        var driverTotal = await fetchDriverBalances();
        const totDriverBal = driverTotal.toFixed(2);
        const driverBal = numberWithSpaces(totDriverBal);
        document.getElementById('balDriver').value = "₱ " + driverBal;
        //console.log(driverTotal);

        //owner
        var ownerTotal = await fetchOwnerBalances();
        const totOwnerBal = ownerTotal.toFixed(2);
        const ownerBal = numberWithSpaces(totOwnerBal);
        document.getElementById('balOwner').value = "₱ " + ownerBal;
        //console.log(ownerTotal)


        //compute the general balance
        var genBalance = parkBai + driverTotal + ownerTotal;
        //console.log(genBalance);

        //update general balance
        const AdminRef = ref(db, "ADMIN");
        update(AdminRef, { general_balance: genBalance });

        //display balance
        var genTotal = await generalBal();
        const curgenBal = genTotal.toFixed(2);
        const formatGen = numberWithSpaces(curgenBal);
        document.getElementById('genBal').value = "₱ " + formatGen;
    }

    fetchData();

    //arrange the numbers
    function numberWithSpaces(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return parts.join(".");
    }

    

    function getDriver(driverUID) {
        const VehicleRef = ref(db, `DRIVER/${driverUID}/ACCOUNT/balance`);

        return get(VehicleRef).then((snapshot) => {
            const bal = snapshot.val() || 0;
            return bal;
        });
    };

    

    function getOwner(ownerUID) {
        const VehicleRef = ref(db, `PARK_OWNER/${ownerUID}/INCOME/Current_Balance`);

        return get(VehicleRef).then((snapshot) => {
            const bal = snapshot.val() || 0;
            return bal;
        });
    };
  


    $("#btnDriver").click(function () {
        window.location.href = `/Home/DriverBal`;
    });

    $("#btnOwner").click(function () {
        window.location.href = `/Home/OwnerBal`;
    });

    

});