import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getDatabase, ref, child, onValue, get, update } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

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

    var uid = 0;
    var drvNo = 0;



    const dbRef = ref(db, 'ADMIN/TRANSACTIONS/OWNER');

    //GETTING THE DRIVERS UIDS
    get(dbRef).then((snapshot) => {
        const OwnerUID = [];

        snapshot.forEach((childSnapshot) => {
            // Collect the child IDs (keys)
            const childId = childSnapshot.key;
            OwnerUID.push(childId);

        });
        console.log("Child IDs:", OwnerUID);
        getOwner(OwnerUID);
    });

    // GETTING THE VEHICLE PLATE NUMBER
    function getOwner(OwnerUID) {
        var itemsPerPage = 8;
        var currentPage = 1;
        var table = $("#table");
        var tbody = $('#tbody');

        function displayTablePage(page, data) {
            tbody.empty();
            var startIndex = (page - 1) * itemsPerPage;
            var endIndex = startIndex + itemsPerPage;
            var resultRow = 0;

            const formatTime = (time) => {
                const [hours, minutes, seconds] = time.split(':');
                const hh = String((parseInt(hours, 10) % 12) || 12).padStart(2, '0');
                const ampm = parseInt(hours, 10) >= 12 ? 'PM' : 'AM';
                return `${hh}:${minutes}:${seconds} ${ampm}`;
            };

            for (var i = startIndex; i < endIndex && i < data.length; i++) {
                const details = data[i];
                let trow = $('<tr>');
                let td1 = $('<td>').text(details.Name).addClass('fitText');
                let td2 = $('<td>').text(details.Amount);
                let td3 = $('<td>').text(details.Date);
                let td6 = $('<td>').text(formatTime(details.Timestamp));
                let td5 = $('<td>').text(details.Type);
                let td4 = $('<td>').text(details.Ref_Num);
                
                trow.append(td1, td2, td3,td6, td5, td4);
                tbody.append(trow);
                resultRow++;
            }

            $('#currentPage').text(page);

            if (currentPage === 1) {
                $('#prevBtn').prop("disabled", true).addClass("inactive");
            } else {
                $('#prevBtn').prop("disabled", false).removeClass("inactive");
            }

            var totalPages = Math.ceil(data.length / itemsPerPage);

            if (page >= totalPages) {
                $('#nextBtn').prop("disabled", true).addClass("inactive");
            } else {
                $('#nextBtn').prop("disabled", false).removeClass("inactive");


            }
        }

        // Fetch data from Firebase
        var promises = OwnerUID.map(uid => {
            const OwnRef = ref(db, "ADMIN/TRANSACTIONS/OWNER/" + uid);
            return get(OwnRef).then(snapshot => snapshot.val());
        });

        Promise.all(promises).then(data => {



            data.sort((a, b) => {
                const parseDate = (dateString) => {
                    //console.log(dateString);
                    const [day, month, year] = dateString.split('/');
                    return new Date(`${year}/${month}/${day}`);
                };

                const dateA = parseDate(a.Date);
                const dateB = parseDate(b.Date);

                if (dateB > dateA) {
                    return 1;
                } else if (dateB < dateA) {
                    return -1;
                } else {

                    const timeA = a.Timestamp || '00:00:00';//hh:mm:ss
                    const timeB = b.Timestamp || '00:00:00';

                   

                   // console.log(formatTime(timeA));
                    


                    const dateTimeA = new Date(`2000-01-01T${timeA}`);
                    const dateTimeB = new Date(`2000-01-01T${timeB}`);


                    if (dateTimeB > dateTimeA) {
                        return 1;
                    } else if (dateTimeB < dateTimeA) {
                        return -1;
                    } else {
                        return 0;
                    }
                }
            });



            // Initial display of the first page
            displayTablePage(currentPage, data);

            // Event handlers for pagination buttons
            $('#prevBtn').on('click', function () {
                if (currentPage > 1) {
                    currentPage--;
                    displayTablePage(currentPage, data);
                }
            });

            $('#nextBtn').on('click', function () {
                var totalPages = Math.ceil(data.length / itemsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    displayTablePage(currentPage, data);
                }
            });
        });
    }


    //OTHER PAGINATION
    //function getOwner(OwnerUID) {
    //    var itemsPerPage = 8;
    //    var currentPage = 1;
    //    var table = $("#table");
    //    var tbody = $('#tbody');

    //    function displayTablePage(page, data) {
    //        tbody.empty();
    //        var startIndex = (page - 1) * itemsPerPage;
    //        var endIndex = startIndex + itemsPerPage;
    //        var resultRow = 0;

    //        for (var i = startIndex; i < endIndex && i < data.length; i++) {
    //            const details = data[i];
    //            let trow = $('<tr>');
    //            let td1 = $('<td>').text(details.Name).addClass('fitText');
    //            let td2 = $('<td>').text(details.Amount);
    //            let td3 = $('<td>').text(details.Date);
    //            let td5 = $('<td>').text(details.Type);
    //            let td4 = $('<td>').text(details.Ref_Num);
    //            trow.append(td1, td2, td3, td5, td4);
    //            tbody.append(trow);
    //            resultRow++;
    //        }

    //        $('#currentPage').text(page);

    //        if (currentPage === 1) {
    //            $('#prevBtn').prop("disabled", true).addClass("inactive");
    //        } else {
    //            $('#prevBtn').prop("disabled", false).removeClass("inactive");
    //        }

    //        var totalPages = Math.ceil(data.length / itemsPerPage);

    //        if (page >= totalPages) {
    //            $('#nextBtn').prop("disabled", true).addClass("inactive");
    //        } else {
    //            $('#nextBtn').prop("disabled", false).removeClass("inactive");
    //        }

    //        updatePageButtons(page, totalPages, data);
    //    }

    //    function updatePageButtons(currentPage, totalPages, data) {
    //        var paginationContainer = $('#pagination1');
    //        paginationContainer.empty();

    //        for (var i = 1; i <= totalPages; i++) {
    //            var pageBtn = $('<button>').text(i).addClass('pageBtn');
    //            if (i === currentPage) {
    //                pageBtn.addClass('active');
    //            }
    //            pageBtn.on('click', function () {
    //                currentPage = parseInt($(this).text());
    //                displayTablePage(currentPage, data);
    //            });
    //            paginationContainer.append(pageBtn);
    //        }
    //    }

    //    //  Fetch data from Firebase
    //    var promises = OwnerUID.map(uid => {
    //        const OwnRef = ref(db, "ADMIN/TRANSACTIONS/OWNER/" + uid);
    //        return get(OwnRef).then(snapshot => snapshot.val());
    //    });

    //    Promise.all(promises).then(data => {

    //        data.sort((a, b) => {
               
    //            const parseDate = (dateString) => {
    //                const [day, month, year] = dateString.split('/');
    //                return new Date(`${year}/${month}/${day}`);
    //            };

    //            const dateA = parseDate(a.Date);
    //            const dateB = parseDate(b.Date);

    //            if (dateB > dateA) {
    //                return 1;
    //            } else if (dateB < dateA) {
    //                return -1;
    //            } else {

    //                const timeA = a.Timestamp || '00:00:00';
    //                const timeB = b.Timestamp || '00:00:00';


    //                const dateTimeA = new Date(`2000-01-01T${timeA}`);
    //                const dateTimeB = new Date(`2000-01-01T${timeB}`);


    //                if (dateTimeB > dateTimeA) {
    //                    return -1;
    //                } else if (dateTimeB < dateTimeA) {
    //                    return 1;
    //                } else {
    //                    return 0;
    //                }
    //            }
    //        });

    //        // Initial display of the first page
    //        displayTablePage(currentPage, data);

    //        //Event handlers for pagination buttons
    //        $('#prevBtn').on('click', function () {
    //            if (currentPage > 1) {
    //                currentPage--;
    //                displayTablePage(currentPage, data);
    //            }
    //        });

    //        $('#nextBtn').on('click', function () {
    //            var totalPages = Math.ceil(data.length / itemsPerPage);
    //            if (currentPage < totalPages) {
    //                currentPage++;
    //                displayTablePage(currentPage, data);
    //            }
    //        });
    //    });
    //}








});
