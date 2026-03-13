transactions = {}


def save_transaction(txn_id, data):
    transactions[txn_id] = data


def get_transaction(txn_id):
    return transactions.get(txn_id)


def update_transaction_status(txn_id, status):
    if txn_id in transactions:
        transactions[txn_id]["status"] = status
        return transactions[txn_id]

    return None


def get_all_transactions():
    return transactions
