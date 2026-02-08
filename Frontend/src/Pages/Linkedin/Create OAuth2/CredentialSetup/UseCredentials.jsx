import { useState } from 'react';
import './Model.css';

const mockApi = {
  get: async (key) => JSON.parse(localStorage.getItem(key) || '[]'),
  add: async (key, data) => {
    const items = await mockApi.get(key);
    const newItems = [...items, { ...data, id: Date.now() }];
    localStorage.setItem(key, JSON.stringify(newItems));
    return newItems;
  },
  delete: async (key, id) => {
    const items = await mockApi.get(key);
    const newItems = items.filter(item => item.id !== id);
    localStorage.setItem(key, JSON.stringify(newItems));
    return newItems;
  },
};

const UseCredentials = () => {
  const [identityProviders, setIdentityProviders] = useState([]);
  const [externalCredentials, setExternalCredentials] = useState([]);
  const [namedCredentials, setNamedCredentials] = useState([]);
  const [principals, setPrincipals] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, type: '' });

  const loadData = async () => {
    setIdentityProviders(await mockApi.get('identityProviders'));
    setExternalCredentials(await mockApi.get('externalCredentials'));
    setNamedCredentials(await mockApi.get('namedCredentials'));
    setPrincipals(await mockApi.get('principals'));
  };

  useState(() => {
    loadData();
  }, []);

  const openModal = (type) => setModal({ isOpen: true, type });
  const closeModal = () => {
    setModal({ isOpen: false, type: '' });
    loadData();
  };

  const addCredential = async (type, data) => {
    await mockApi.add(type, data);
    closeModal();
  };

  const deleteCredential = async (type, id) => {
    await mockApi.delete(type, id);
    loadData();
  };

  return {
    identityProviders,
    externalCredentials,
    namedCredentials,
    principals,
    addCredential,
    deleteCredential,
    modal,
    openModal,
    closeModal,
  };
};

export default UseCredentials;