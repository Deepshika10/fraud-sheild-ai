transaction_history = []

def monitor_transaction(transaction):

    # store transaction
    transaction_history.append(transaction)

    # ensure sender and receiver exist
    if "sender" not in transaction or "receiver" not in transaction:
        return False

    sender = transaction["sender"]
    receiver = transaction["receiver"]

    # check if sender received money earlier
    for t in transaction_history:
        if t["receiver"] == sender:
            return True

    return False