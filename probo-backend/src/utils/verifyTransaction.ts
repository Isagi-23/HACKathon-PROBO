import { PublicKey, VersionedTransactionResponse } from "@solana/web3.js";

export const verifySignatureFromTransaction = (
  transaction: VersionedTransactionResponse | null,
  adminPublic: PublicKey,
  userPublicKey: string
) => {
  if (!transaction) {
    console.log("Transaction not found");
    return;
  }
  if (transaction.meta && transaction.meta.err === null) {
    console.log("Transaction details:", transaction);

    // Admin's public key
    const adminPublicKey = new PublicKey(adminPublic); // Replace with actual admin's public key

    // Verify that the transaction was initiated by the user
    const senderPublicKey = transaction.transaction.message
      ?.getAccountKeys()
      .get(0)
      ?.toString(); // Assuming the first key is the sender

    console.log(senderPublicKey);
    console.log(transaction.transaction.message?.getAccountKeys());
    if (senderPublicKey !== userPublicKey) {
      console.log("Transaction was not initiated by the expected user");
      return false;
    }

    // Verify the transfer to the admin's account
    let adminReceived = false;
    const postBalances = transaction.meta.postBalances;
    const preBalances = transaction.meta.preBalances;
    console.log(postBalances, preBalances, "balances");

    transaction.transaction.message
      ?.getAccountKeys()
      .staticAccountKeys?.forEach((accountKey: any, index: any) => {
        if (accountKey.equals(adminPublicKey)) {
          const balanceChange = postBalances[index] - preBalances[index];
          console.log("Admin account balance change:", balanceChange);

          if (balanceChange > 0) {
            adminReceived = true;
          }
        }
      });

    if (!adminReceived) {
      console.log("Admin did not receive the funds.");
      return false;
    }

    console.log("Admin received the funds from the correct user successfully.");
    return true;
  } else {
    console.log("Transaction failed:", transaction?.meta?.err);
    return false;
  }
};
