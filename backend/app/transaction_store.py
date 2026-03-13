from threading import Lock


transactions = {}
transactions_lock = Lock()

# Separate store for blockchain verification records
# Maps transaction_id -> blockchain record
blockchain_records = {}


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


def save_blockchain_record(txn_id, blockchain_record):
    """
    Store blockchain record for a transaction.

    Args:
        txn_id: Transaction ID
        blockchain_record: Dict with blockchain hash and metadata
    """
    with transactions_lock:
        if txn_id in transactions:
            # Add blockchain record to transaction data
            transactions[txn_id]["blockchain_record"] = blockchain_record

        # Also keep separate record for quick lookup
        blockchain_records[txn_id] = blockchain_record


def get_blockchain_record(txn_id):
    """
    Retrieve blockchain record for a transaction.

    Args:
        txn_id: Transaction ID

    Returns:
        Blockchain record dict, or None if not found
    """
    with transactions_lock:
        return blockchain_records.get(txn_id)


def get_all_transactions():
    with transactions_lock:
        return dict(transactions)


def get_all_transactions_list():
    with transactions_lock:
        return list(transactions.values())
