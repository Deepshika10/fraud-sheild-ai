transaction_history = []

MAX_HISTORY = 1000   # prevent unlimited memory usage

def monitor_transaction(transaction):

    global transaction_history

    # -----------------------------
    # Store transaction
    # -----------------------------

    transaction_history.append(transaction)

    # keep history limited
    if len(transaction_history) > MAX_HISTORY:
        transaction_history.pop(0)

    # -----------------------------
    # Ensure sender and receiver exist
    # -----------------------------

    if "sender" not in transaction or "receiver" not in transaction:
        return False

    sender = transaction["sender"]
    receiver = transaction["receiver"]
    amount = transaction.get("amount", 0)

    # -----------------------------
    # Detect suspicious chain
    # A → B → C
    # -----------------------------

    for t in transaction_history:

        # If sender previously received money
        if t.get("receiver") == sender:

            # Check if transaction amount is large
            if amount > 10000:
                return True

    # -----------------------------
    # Detect circular transactions
    # A → B → A
    # -----------------------------

    for t in transaction_history:

        if t.get("sender") == receiver and t.get("receiver") == sender:
            return True

    # -----------------------------
    # Detect rapid transaction burst
    # -----------------------------

    recent_count = 0

    for t in transaction_history:
        if t.get("sender") == sender:
            recent_count += 1

    if recent_count > 5:
        return True

    return False