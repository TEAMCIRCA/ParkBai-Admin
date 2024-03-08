import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getDatabase, get, ref, update, serverTimestamp ,push,set} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";
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
    const imgRef = ref(db, '/ADMIN/ASSETS/lightWordMark');
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

    //FETCH PERCENTAGE
    const perRef = ref(db, 'ADMIN/percent');
    get(perRef).then((snapshot) => {
        
        if (snapshot.exists()) {
            var pbPercent = snapshot.val()* 100;
            
            document.getElementById('current_percent').value = pbPercent+"%";

        }
        else {
            console.error('File path not found in database.');
        }
    })

    //SET NEW PERCENTAGE
    $("#btnPercent").click(function () {
        var newPer = document.getElementById('new_percent').value;
        if (newPer > 100 || newPer < 1) {
            alert("Error!Please input value within the 1 to 100.");
            document.getElementById('new_percent').value = "";
        }
        else {
            const newPerRef = ref(db, '/ADMIN/');
            var newPertoDB = newPer / 100;
            if (confirm("Confirm to change percentage?")) {
                try {
                   

                    update(newPerRef, {
                        percent: newPertoDB
                    });
                    window.location.href = `/Home/AdminInstall`;

                }
                catch (error) {
                    alert('Error: ' + error);
                }
            }
            
        }
        
    });
    //arrange the numbers
    function numberWithSpaces(x) {
        // Ensure x is a string before processing
        x = typeof x === 'string' ? x : x.toString();

        // Replace spaces with an empty string before formatting
        x = x.replace(/\s/g, '');

        var parts = x.split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return parts.join(".");
    }



    var sensor = 0;
    var scanner = 0;
    var installfee = 0;

    //Fetch Parkbai Pricing Sensor
    const sensorRef = ref(db, 'ADMIN/sensor');
    get(sensorRef).then((snapshot) => {
        if (snapshot.exists()) {
             sensor = snapshot.val();
            var SensorPrice = numberWithSpaces(sensor);
            document.getElementById('priceSensor').value = "₱ " + SensorPrice;
        }
        else {
            console.error('File path not found in database.');
        }
    })
    //Fetch Parkbai Pricing Scanner
    const scannerRef = ref(db, 'ADMIN/rfid_scanner');
    get(scannerRef).then((snapshot) => {
        if (snapshot.exists()) {
            scanner = snapshot.val();
            var ScannerPrice = numberWithSpaces(scanner);
            document.getElementById('priceScanner').value = "₱ " + ScannerPrice;
        }
        else {
            console.error('File path not found in database.');
        }
    })
    //Fetch Parkbai Pricing Installation Fee
    const feeRef = ref(db, 'ADMIN/installFee');
    get(feeRef).then((snapshot) => {
        if (snapshot.exists()) {
             installfee = snapshot.val();
            var feePer = installfee * 100;
            document.getElementById('priceFee').value = feePer + " %";
        }
        else {
            console.error('File path not found in database.');
        }
    })
    $("#numsensors").on("input", function () {
        // Remove non-numeric characters, allowing only whole numbers
        $(this).val($(this).val().replace(/[^0-9]/g, ''));
        if (this.value === '') {
            this.value = '0';
        }
    });
    $("#numscanner").on("input", function () {
        // Remove non-numeric characters, allowing only whole numbers
        $(this).val($(this).val().replace(/[^0-9]/g, ''));
        if (this.value === '') {
            this.value = '0';
        }
    });

   

    var totalPayment = 0;

    //INSTALLATION FEE COMPUTATION
    $("#btnCalculate").click(function () {
        var numsensorsInput = document.getElementById('numsensors');
        var numscannerInput = document.getElementById('numscanner');

        if (!numsensorsInput.checkValidity() || !numscannerInput.checkValidity()) {
            alert('Please fill in all required fields.');
            return;
        }

        var sensorPcs = document.getElementById('numsensors').value;
        var scannerPcs = document.getElementById('numscanner').value;

        var totSensor = sensor * sensorPcs;
        var totScanner = scanner * scannerPcs;
        var initalTotal = totSensor + totScanner;
        var totFee = initalTotal * installfee;
        totalPayment = initalTotal + totFee;

     
        
        var finSensor = numberWithSpaces(totSensor);
         var finScanner = numberWithSpaces(totScanner); 
        var finFee = numberWithSpaces(totFee);
         var finTotal = numberWithSpaces(totalPayment);

        //console.log(finSensor);
        //console.log(finScanner);
        //console.log(finFee);
        //console.log(finTotal);

    
        document.getElementById('totalSensors').value = "₱ " + finSensor;
        document.getElementById('totalScanner').value = "₱ " + finScanner;
        document.getElementById('totalFee').value = "₱ " + finFee;
        document.getElementById('totalPayment').value = "₱ " + finTotal;

        const dbRef = ref(db, 'PARK_OWNER');
        get(dbRef).then((snapshot) => {
            const OwnerUID = [];

            snapshot.forEach((childSnapshot) => {
                // Collect the child IDs (keys)
                const childId = childSnapshot.key;
                OwnerUID.push(childId);

            });
            getOwner(OwnerUID);

        });

        

    });

    //Choose owner
    

    async function getOwner(OwnerUID) {
        const ownerDetails = [];

        for (let i = 0; i < OwnerUID.length; i++) {
            const VehicleRef = ref(db, "PARK_OWNER/" + OwnerUID[i] + "/ACCOUNT");

            try {
                const snapshot = await get(VehicleRef);
                const details = snapshot.val();

                if (details && (details.Application === "ACCEPTED" || details.Application === "accepted")) {
                    const ownerInfo = {
                        uid: OwnerUID[i],
                        name: details.Last_Name + ", " + details.First_Name + " " + details.Middle_Name
                    };
                    ownerDetails.push(ownerInfo);
                }
            } catch (error) {
                console.error("Error fetching owner details:", error);
            }
        }

        // Now that the loop is complete, you can log or use ownerDetails
        console.log(ownerDetails);

        // Call a function to populate the dropdown with the fetched owner names and UIDs
        populateDropdown(ownerDetails);
    }
    function populateDropdown(ownerDetails) {
        const dropdown = document.getElementById('ownerDropdown');

        // Clear existing options
        dropdown.innerHTML = '';

        // Populate dropdown with owner names and set UID as a data attribute
        ownerDetails.forEach((owner) => {
            const option = document.createElement('option');
            option.value = owner.name; // Use owner.name for the displayed text
            option.text = owner.name;  // Use owner.name for the value
            option.setAttribute('data-uid', owner.uid); // Set UID as a data attribute
            dropdown.add(option);
        });
    }


    



   


    // Get the current date and time
    var currentDate = new Date();

    // Format the date as "dd-mm-yyyy"
    var day = currentDate.getDate().toString().padStart(2, '0');
    var month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    var year = currentDate.getFullYear();

    var formattedDate = day + '/' + month + '/' + year;
    // Get the current timestamp
    const timestamp = serverTimestamp();

    // Format timestamp to 24-hour time string
    const formattedTime = timestamp === serverTimestamp()
        ? new Date().toLocaleTimeString('en-US', { hour12: false })
        : new Date(timestamp).toLocaleTimeString('en-US', { hour12: false });


    //GENERATING TRANSACTION ID
    function generateRandomCode(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let randomCode = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            randomCode += characters.charAt(randomIndex);
        }

        return randomCode;
    }

    const transactionId = generateRandomCode(13);


    //UPDATING THE PARKBAI BALANCE 
    var genBal = 0; 
    //GET PARKBAI BALANCE
    const adminBalRef = ref(db, 'ADMIN/parkbai_balance');
    get(adminBalRef).then((snapshot) => {
        if (snapshot.exists()) {
             genBal = snapshot.val();
            //console.log(genBal);
        }
        else {
            console.error('File path not found in database.');
        }
    })
    
    $("#btnPricing").click(function () {
        if (totalPayment === 0 || totalPayment === '') {
            alert('Enter number of sensors and scanners first!');
        }
        else {

            //chosen dropdown
            const dropdown = document.getElementById('ownerDropdown');
            const selectedOption = dropdown.options[dropdown.selectedIndex];
            const selectedName = selectedOption.value;
            const selectedUid = selectedOption.getAttribute('data-uid');

            //console.log('Selected Name:', selectedName);
            //console.log('Selected UID:', selectedUid);

            
            

            

           /* var AdminBal = genBal;*/
            //console.log(genBal);
            //var NewAdminBal = genBal + totalPayment; 
            //console.log(NewAdminBal);
            
            if (confirm("Proceed to Payment?")) {
                try {
                    let OwnerName = selectedName;
                    let UserID = selectedUid;
                    let transType = "INSTALLATION";
                    if (OwnerName === "" && UserID === "") {
                        alert('Error!');
                        window.location.href = `/Home/AdminInstall`;
                        
                    }
                    else {

                        //Add transaction to Owner in Admin
                        const adminRef = ref(db, "ADMIN/TRANSACTIONS/OWNER");
                        const newReqOut = push(adminRef);
                        //Generate a unique reference number using push()
                        /*const transactionId = push(adminRef).key;*/

                        set(newReqOut, {
                            Name: OwnerName,
                            UID: UserID,
                            Amount: totalPayment,
                            Date: formattedDate,
                            Ref_Num: transactionId,
                            Timestamp: formattedTime,
                            Type: transType,
                        });

                        //Update ParkBai Balance
                        console.log(genBal);
                        var NewAdminBal = genBal + totalPayment; 
                        console.log(NewAdminBal);
                        const AdminRef = ref(db, "ADMIN");
                        update(AdminRef, { parkbai_balance: NewAdminBal });

                        alert('Payment Successful!');
                        window.location.href = `/Home/AdminInstall`;
                    }


                }
                catch (error) {
                    alert('Error: ' + error);
                }
            }
        }
        
    });
    

    
});