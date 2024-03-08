import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getDatabase, ref, set, push, get, update, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";

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


    //$('#payoutButton').on('click', function () {
    //    initiatePayout();
    //});

    const dbRef = ref(db, 'DRIVER');
    //GETTING THE DRIVERS UIDS
    get(dbRef).then((snapshot) => {
        const DriverUID = [];

        snapshot.forEach((childSnapshot) => {
            // Collect the child IDs (keys)
            const childId = childSnapshot.key;
            DriverUID.push(childId);

        });
        getDriver(DriverUID);
    });
    function getDriver(DriverUID) {
        var itemsPerPage = 8;
        var currentPage = 1;

        function displayTablePage(page) {
            $('#tbody').empty();
            //console.log(page);
            var startIndex = (page - 1) * itemsPerPage;
            var endIndex = startIndex + itemsPerPage;
            var reqCount = 0;

            for (var i = startIndex; i < endIndex && i < DriverUID.length; i++) {
                const RfidRef = ref(db, "DRIVER/" + DriverUID[i] + "/RFID_REQUEST");
                let driverID = DriverUID[i];

                get(RfidRef).then((snapshot) => {
                    snapshot.forEach((childSnapshot) => {
                        
                        const requestUID = childSnapshot.key;
                        const details = childSnapshot.val();
                        let amount = details.Amount;
                        let name = details.Account_Lname + ", " + details.Account_Fname + " " + details.Account_Mname;
                        let stat = details.Release_Status;
                        //console.log(stat);
                        if (stat == "PENDING") {
                            reqCount++;
                            let trow = $('<tr>');
                            let td1 = $('<td>').text(details.Account_Lname + ", " + details.Account_Fname + " " + details.Account_Mname);
                            let td2 = $('<td>').text(details.Account_Email).addClass('low');
                            let td3 = $('<td>').text("₱ " + details.Amount.toFixed(2));

                            let btnRelease = $('<button>').addClass('btnView')
                                .attr({
                                    'type': 'button',
                                    'id': 'btnRelease',
                                    'data-id': requestUID,
                                    'data-id1': amount,
                                    'data-id2': driverID,
                                    'data-id3': name

                                })
                                .text('Release');

                            let btnReject = $('<button>').addClass('btnView')
                                .attr({
                                    'type': 'button',
                                    'id': 'btnReject',
                                    'data-id': requestUID,
                                    'data-id1': driverID
                                })
                                .text('Reject');
                            //console.log('2');
                            trow.append(td1, td2, td3, $('<td>').append(btnRelease, btnReject));
                            $('#tbody').append(trow);
                        }
                        else {
                            document.getElementById('emptyText').style.display = 'block';
                        }

                    });

                });
                if (reqCount == 0) {
                    document.getElementById('emptyText').style.display = 'none';
                }
                else {
                    document.getElementById('emptyText').style.display = 'block';
                }

            }

            // Event delegation for the btnView click event
            $('#tbody').on("click", "#btnRelease", function () {
                const reqUID = $(this).data("id");
                const amount = $(this).data("id1");
                const OwnerID = $(this).data("id2");
                const OwnerName = $(this).data("id3");
                //console.log(reqUID, amount, OwnerID);
                initiatePayout(reqUID, amount, OwnerID, OwnerName);
            });
            $('#tbody').on("click", "#btnReject", function () {
                const reqUID = $(this).data("id");
                const OwnerID = $(this).data("id1");
                rejectRequest(reqUID, OwnerID)
            });

            $('#currentPage').text(page);

            // Hiding buttons
            if (currentPage === 1) {
                $('#prevBtn').prop("disabled", true).addClass("inactive");
            } else {
                $('#prevBtn').prop("disabled", false).removeClass("inactive");
            }

            if (startIndex + itemsPerPage >= DriverUID.length) {
                $('#nextBtn').prop("disabled", true).addClass("inactive");
            } else {
                $('#nextBtn').prop("disabled", false).removeClass("inactive");
            }
        }



        // Initial display of the first page
        displayTablePage(currentPage);

        $('#prevBtn').on('click', function () {
            if (currentPage > 1) {
                currentPage--;
                displayTablePage(currentPage);

            }
        });

        $('#nextBtn').on('click', function () {
            if (currentPage < Math.ceil(DriverUID.length / itemsPerPage)) {
                currentPage++;
                displayTablePage(currentPage);
            }
        });

    }

    async function initiatePayout(reqUID, amount, OwnerID, OwnerName) {

        var Balance = await GetBalance(OwnerID);
        var NewBal = Balance - amount;
        var payoutUrl = '/CashOut/InitiatePayout';

        $.ajax({
            type: 'POST',
            url: payoutUrl,
            contentType: 'application/json',
            data: JSON.stringify({ amount: amount }),
            success: function (response) {
                if (response.success) {
                    updateRequest(OwnerID, reqUID, NewBal, response.transactionId, amount, OwnerName);
                } else {
                    console.error('Error initiating payout:', response.message);
                }
            },
            error: function (error) {
                console.error('AJAX error:', error);
            }
        });

    }

    function GetBalance(UserID) {
        return new Promise((resolve, reject) => {
            const IncomeRef = ref(db, "DRIVER/" + UserID + "/ACCOUNT");
            get(IncomeRef).then((snapshot) => {
                const IncomeData = snapshot.val();
                if (snapshot.exists()) {
                    const CurrentBalance = IncomeData.balance;
                    console.log(CurrentBalance);
                    resolve(CurrentBalance);
                } else {
                    reject('File path not found in the database.');
                }
            }).catch((error) => {
                reject(error);
            });
        });
    }


    async function updateRequest(UserID, RefNum, NewBal, transactionId, amount, OwnerName) {
        var AdminBal = await getAdminBal();
        var NewAdminBal = AdminBal - amount;
        var status = "RELEASED";
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('en-GB');

        const IncomeRef = ref(db, "DRIVER/" + UserID + "/ACCOUNT");
        const RequestRef = ref(db, "DRIVER/" + UserID + "/RFID_REQUEST/" + RefNum);
        const AdminRef = ref(db, "ADMIN");

        await update(IncomeRef, { balance: NewBal });

        await update(RequestRef, {
            Release_Status: status,
            Release_Date: formattedDate,
            Reference_Number: transactionId,
        });

        await update(AdminRef, { general_balance: NewAdminBal });


        OutTrans(OwnerName, UserID, amount, formattedDate, transactionId);
        alert("Cash Released Successfully!");
        location.reload();
    }

    function getAdminBal() {
        return new Promise((resolve, reject) => {
            const AdminRef = ref(db, "ADMIN");
            get(AdminRef).then((snapshot) => {
                const AdminData = snapshot.val();
                if (snapshot.exists()) {
                    const CurrentBalance = AdminData.general_balance;
                    resolve(CurrentBalance);
                } else {
                    reject('File path not found in the database.');
                }
            }).catch((error) => {
                reject(error);
            });
        });
    }
    // Get the current timestamp
    const timestamp = serverTimestamp();

    // Format timestamp to 24-hour time string
    const formattedTime = timestamp === serverTimestamp()
        ? new Date().toLocaleTimeString('en-US', { hour12: false })
        : new Date(timestamp).toLocaleTimeString('en-US', { hour12: false });

    //console.log(formattedTime);

    // Add Transaction to Admin
    function OutTrans(OwnerName, UserID, amount, formattedDate, transactionId) {
        const adminRef = ref(db, "ADMIN/TRANSACTIONS/DRIVER");
        const newReqOut = push(adminRef);
        const transType = "RFID";

        set(newReqOut, {
            fullname: OwnerName,
            UID: UserID,
            amount: amount,
            date: formattedDate,
            ref_number: transactionId,
            time: formattedTime,
            type: transType,
        });
    }


    //REJECT REQUEST
    function rejectRequest(reqUID, OwnerID) {
        const RequestRef = ref(db, "DRIVER/" + OwnerID + "/RFID_REQUEST/" + reqUID);
        var status = "REJECTED";
        if (confirm("Reject this Request?")) {
            try {
                let reason = prompt("Reason for Rejecting this Request: ", "");

                update(RequestRef, {
                    Release_Status: status,
                    comment: reason
                });
                window.location.href = `/Home/RfidRequest`;

            }
            catch (error) {
                alert('Error: ' + error);
            }
        }


    }
});