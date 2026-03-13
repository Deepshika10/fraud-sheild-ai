from threading import Lock


transactions = {}
transactions_lock = Lock()


def save_transaction(txn_id, data):
    with transactions_lock:
        transactions[txn_id] = data


def get_transaction(txn_id):
    with transactions_lock:
        return transactions.get(txn_id)


def update_transaction_status(txn_id, status):
    with transactions_lock:
        if txn_id in transactions:
            transactions[txn_id]["status"] = status
            return transactions[txn_id]

        return None


def get_all_transactions():
    with transactions_lock:
        return dict(transactions)


def get_all_transactions_list():
    with transactions_lock:
        return list(transactions.values())
