const pendingObjectStoreName = "new_transaction";

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function () {
  const db = request.result;

  if (!db.objectStoreNames.contains(pendingObjectStoreName)) {
    db.createObjectStore(pendingObjectStoreName, { autoIncrement: true });
  }
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    uploadTransactions();
  }
};

request.onerror = function (event) {
  console.error(event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction([pendingObjectStoreName], "readwrite");

  const budgetObjectStore = transaction.objectStore(pendingObjectStoreName);

  budgetObjectStore.add(record);
}

function uploadTransactions() {
  const transaction = db.transaction([pendingObjectStoreName], "readwrite");

  const budgetObjectStore = transaction.objectStore(pendingObjectStoreName);

  const getAll = budgetObjectStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      });
    }
  };
}

window.addEventListener("online", uploadTransactions);
