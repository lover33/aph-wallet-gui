import lockr from 'lockr';
import { wallet } from '@cityofzion/neon-js';

const WALLETS_STORAGE_KEY = 'aph.wallets';
const CURRENT_WALLET_STORAGE_KEY = 'aph.current_wallet';

export default {

  add(name, data) {
    const wallets = this.getAll();

    lockr.set(WALLETS_STORAGE_KEY, _.set(wallets, name, data));

    return this;
  },

  clearCurrentWallet() {
    this.setCurrentWallet(null);
  },

  getAll() {
    return lockr.get(WALLETS_STORAGE_KEY, {});
  },

  getAllAsArray() {
    return _.values(this.getAll());
  },

  getCurrentWallet() {
    return lockr.get(CURRENT_WALLET_STORAGE_KEY);
  },

  getOne(name) {
    return _.get(this.getAll(), name);
  },

  walletExists(name) {
    return !!this.getOne(name);
  },

  openSavedWallet(name, passphrase) {
    return new Promise((resolve, reject) => {
      try {
        if (this.walletExists(name) === false) {
          return reject(`Wallet with name '${name}' not found.`);
        }
        const walletToOpen = this.getOne(name);
        const wif = wallet.decrypt(walletToOpen.encryptedWIF, passphrase);
        const account = new wallet.Account(wif);
        const currentWallet = {
          wif,
          encryptedWIF: walletToOpen.encryptedWIF,
          address: account.address,
          passphrase,
          privateKey: account.privateKey,
        };

        this.setCurrentWallet(currentWallet);

        return resolve(currentWallet);
      } catch (e) {
        return reject(e);
      }
    });
  },

  openEncryptedKey(encryptedKey, passphrase) {
    return new Promise((resolve, reject) => {
      try {
        const wif = wallet.decrypt(encryptedKey, passphrase);
        const account = new wallet.Account(wif);
        const currentWallet = {
          wif,
          encryptedWIF: encryptedKey,
          address: account.address,
          passphrase,
          privateKey: account.privateKey,
        };

        this.setCurrentWallet(currentWallet);

        return resolve(currentWallet);
      } catch (e) {
        return reject(e);
      }
    });
  },

  openWIF(wif) {
    return new Promise((resolve, reject) => {
      try {
        const account = new wallet.Account(wif);
        const currentWallet = {
          wif,
          address: account.address,
          privateKey: account.privateKey,
        };

        this.setCurrentWallet(currentWallet);

        return resolve(currentWallet);
      } catch (e) {
        return reject(e);
      }
    });
  },

  setCurrentWallet(wallet) {
    return lockr.set(CURRENT_WALLET_STORAGE_KEY, wallet);
  },

};