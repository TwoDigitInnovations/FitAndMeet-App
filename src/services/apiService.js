import axios from 'axios';
import { getAuthToken, deleteAuthToken } from '../utils/storage';
import Constants from '../utils/Constant';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

const ConnectionCheck = {
  isConnected: () => {
    return new Promise((resolve, reject) => {
      NetInfo.fetch().then(state => {
        resolve(state.isConnected);
      }).catch(err => {
        reject(err);
      });
    });
  },
};

const reset = (routeName) => {
  console.log('Navigate to:', routeName);
};

// GET API
const GetApi = async (url, props, data) => {
  return new Promise(function (resolve, reject) {
    ConnectionCheck.isConnected().then(
      async connected => {
        console.log('Connected:', connected);
        if (connected) {
          const token = await getAuthToken();
          console.log('API URL:', Constants.baseUrl + url);
          console.log('Token:', `Bearer ${token}`);

          axios
            .get(Constants.baseUrl + url, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              params: { id: data },
            })
            .then(res => {
              resolve(res.data);
            })
            .catch(async err => {
              if (err.response) {
                console.log('Error status:', err.response.status);
                if (err?.response?.status === 401) {
                  await deleteAuthToken();
                  reset('Auth');
                  reject(err.response);
                }
                resolve(err.response.data);
              } else {
                reject(err);
              }
            });
        } else {
          reject('No internet connection');
        }
      },
      err => {
        reject(err);
      },
    );
  });
};

// GET API with keyword parameter
const GetApi2 = async (url, props, data) => {
  return new Promise(function (resolve, reject) {
    ConnectionCheck.isConnected().then(
      async connected => {
        console.log('Connected:', connected);
        if (connected) {
          const token = await getAuthToken();
          console.log('API URL:', Constants.baseUrl + url);
          console.log('Token:', `Bearer ${token}`);

          axios
            .get(Constants.baseUrl + url, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              params: { keyword: data },
            })
            .then(res => {
              resolve(res.data);
            })
            .catch(async err => {
              if (err.response) {
                console.log('Error status:', err.response.status);
                if (err?.response?.status === 401) {
                  await deleteAuthToken();
                  reset('Auth');
                  reject(err.response);
                }
                resolve(err.response.data);
              } else {
                reject(err);
              }
            });
        } else {
          reject('No internet connection');
        }
      },
      err => {
        reject(err);
      },
    );
  });
};

// POST API
const Post = async (url, data, props) => {
  return new Promise(function (resolve, reject) {
    ConnectionCheck.isConnected().then(
      async connected => {
        console.log('Connected:', connected);
        if (connected) {
          const token = await getAuthToken();
          console.log('API URL:', Constants.baseUrl + url);
          console.log('Token:', `Bearer ${token}`);
          console.log('Data:', data);

          axios
            .post(Constants.baseUrl + url, data, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            .then(res => {
              resolve(res.data);
            })
            .catch(async err => {
              if (err.response) {
                console.log('Error status:', err.response.status);
                if (err?.response?.status === 401) {
                  await deleteAuthToken();
                  reset('Auth');
                }
                resolve(err.response.data);
              } else {
                reject(err);
              }
            });
        } else {
          reject('No internet connection');
        }
      },
      err => {
        reject(err);
      },
    );
  });
};

// POST API without authentication (for public endpoints)
const PostPublic = async (url, data) => {
  return new Promise(function (resolve, reject) {
    ConnectionCheck.isConnected().then(
      async connected => {
        console.log('Connected:', connected);
        if (connected) {
          console.log('API URL:', Constants.baseUrl + url);
          console.log('Data:', data);

          axios
            .post(Constants.baseUrl + url, data)
            .then(res => {
              resolve(res.data);
            })
            .catch(err => {
              if (err.response) {
                console.log('Error status:', err.response.status);
                resolve(err.response.data);
              } else {
                reject(err);
              }
            });
        } else {
          reject('No internet connection');
        }
      },
      err => {
        reject(err);
      },
    );
  });
};

// POST API with File Upload
const PostWithFile = async (url, formData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const connected = await ConnectionCheck.isConnected();

      if (!connected) {
        reject('No internet connection');
        return;
      }

      const token = await getAuthToken();
      console.log('API URL:', Constants.baseUrl + url);
      console.log('Token:', `Bearer ${token}`);

      const response = await axios.post(Constants.baseUrl + url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      resolve(response.data);
    } catch (err) {
      if (err.response) {
        console.log('Error status:', err.response.status);
        if (err?.response?.status === 401) {
          await deleteAuthToken();
          reset('Auth');
        }
        resolve(err.response.data);
      } else {
        reject(err);
      }
    }
  });
};

// PUT API
const Put = async (url, data, props) => {
  return new Promise(function (resolve, reject) {
    ConnectionCheck.isConnected().then(
      async connected => {
        console.log('Connected:', connected);
        if (connected) {
          const token = await getAuthToken();
          console.log('API URL:', Constants.baseUrl + url);
          console.log('Token:', `Bearer ${token}`);

          axios
            .put(Constants.baseUrl + url, data, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            .then(res => {
              console.log('Response:', res.data);
              resolve(res.data);
            })
            .catch(async err => {
              if (err.response) {
                if (err?.response?.status === 401) {
                  await deleteAuthToken();
                  reset('Auth');
                }
                resolve(err.response.data);
              } else {
                reject(err);
              }
            });
        } else {
          reject('No internet connection');
        }
      },
      err => {
        reject(err);
      },
    );
  });
};

// PATCH API
const Patch = async (url, data, props) => {
  return new Promise(function (resolve, reject) {
    ConnectionCheck.isConnected().then(
      async connected => {
        console.log('Connected:', connected);
        if (connected) {
          const token = await getAuthToken();
          console.log('API URL:', Constants.baseUrl + url);
          console.log('Token:', `Bearer ${token}`);

          axios
            .patch(Constants.baseUrl + url, data, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            .then(res => {
              console.log('Response:', res.data);
              resolve(res.data);
            })
            .catch(async err => {
              if (err.response) {
                if (err?.response?.status === 401) {
                  await deleteAuthToken();
                  reset('Auth');
                }
                resolve(err.response.data);
              } else {
                reject(err);
              }
            });
        } else {
          reject('No internet connection');
        }
      },
      err => {
        reject(err);
      },
    );
  });
};

// DELETE API
const Delete = async (url, data, props) => {
  return new Promise(function (resolve, reject) {
    ConnectionCheck.isConnected().then(
      async connected => {
        console.log('Connected:', connected);
        if (connected) {
          const token = await getAuthToken();
          console.log('API URL:', Constants.baseUrl + url);
          console.log('Token:', `Bearer ${token}`);

          axios
            .delete(Constants.baseUrl + url, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            .then(res => {
              console.log('Response:', res.data);
              resolve(res.data);
            })
            .catch(async err => {
              if (err.response) {
                if (err?.response?.status === 401) {
                  await deleteAuthToken();
                  reset('Auth');
                }
                resolve(err.response.data);
              } else {
                reject(err);
              }
            });
        } else {
          reject('No internet connection');
        }
      },
      err => {
        reject(err);
      },
    );
  });
};

// Upload File API
const UploadFile = async (fileUri, fileName, fileType) => {
  return new Promise(async (resolve, reject) => {
    try {
      const connected = await ConnectionCheck.isConnected();

      if (!connected) {
        reject('No internet connection');
        return;
      }

      console.log('Uploading file to:', Constants.baseUrl + 'api/upload/single');
      console.log('File URI:', fileUri);
      console.log('File name:', fileName);
      console.log('File type:', fileType);

      // Remove file:// prefix for Android
      let filePath = fileUri;
      if (Platform.OS === 'android' && filePath.startsWith('file://')) {
        filePath = filePath.replace('file://', '');
      }
      console.log(filePath

      )
      try {
        const response = await ReactNativeBlobUtil.fetch(
          'POST',
          Constants.baseUrl + 'api/upload/single',
          {
            'Content-Type': 'multipart/form-data',
          },
          [
            {
              name: 'file',
              filename: fileName || 'upload.jpg',
              type: fileType || 'image/jpeg',
              data: ReactNativeBlobUtil.wrap(filePath),
            },
          ]
        );

        console.log('Upload response status:', response.info().status);
        console.log('Upload response:', response.data);

        const responseData = JSON.parse(response.data);

        if (response.info().status === 200) {
          resolve(responseData);
        } else {
          reject(responseData);
        }
      } catch (err) {
        console.error('Upload error:', err);
        reject(err);
      }
    } catch (error) {
      console.error('Upload file error:', error);
      reject(error);
    }
  });
};

export default {
  GetApi,
  GetApi2,
  Post,
  PostPublic,
  PostWithFile,
  Put,
  Patch,
  Delete,
  UploadFile,
};