import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Trash2, Archive } from 'lucide-react-native';
import apiService from '../../services/apiService';
import { useFocusEffect } from '@react-navigation/native';
import { deleteAuthToken } from '../../utils/storage';
import { AuthContext } from '../../../App';
import { useTranslation } from 'react-i18next';

const UserManagement = ({ navigation }) => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { logout } = useContext(AuthContext);

  useFocusEffect(
    React.useCallback(() => {
      fetchUsers();
    }, [])
  );

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.GetApi('api/admin/users');
      console.log('new response',response)
      if (response.success) {
        setUsers(response.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteUser = (userId, userName) => {
    setSelectedUser({ id: userId, name: userName });
    setShowDeleteModal(true);
  };

  const deleteUser = async () => {
    if (!selectedUser || deleting) return;

    try {
      setDeleting(true);
      const response = await apiService.Put(`api/admin/users/${selectedUser.id}/soft-delete`);
      
      if (response.success) {
        setUsers(users.filter(user => user._id !== selectedUser.id));
        setShowDeleteModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert('Error', 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);
      setShowLogoutModal(false);

      await deleteAuthToken();

      if (logout) {
        await logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
      try {
        await deleteAuthToken();
        if (logout) {
          await logout();
        }
      } catch (localLogoutError) {
        console.error('Local logout failed:', localLogoutError);
      }
    } finally {
      setLoggingOut(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const renderUserCard = ({ item }) => (
    <View style={styles.userCard}>
      <Image
        source={
          item.photos && item.photos.length > 0
            ? { uri: item.photos[0].url }
            : require('../../Assets/images/layout.png')
        }
        style={styles.userImage}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {item.firstName || 'No Name'} 
          {!item.profileCompleted && <Text style={styles.incompleteTag}> (Incomplete)</Text>}
        </Text>
        <Text style={styles.userDetails}>
          {item.age ? `${item.age} • ` : ''}{item.gender || 'N/A'}
        </Text>
        <Text style={styles.userGym}>{item.gymName || 'No Gym'}</Text>
        <Text style={styles.userPhone}>{item.phoneNumber}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteIconButton}
        onPress={() => handleDeleteUser(item._id, item.firstName || 'User')}
      >
        <Trash2 size={20} color="#FF3B6D" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#5D1F3A', '#38152C', '#070A1A']} style={styles.container}>
        <ActivityIndicator size="large" color="#FF3B6D" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#5D1F3A', '#38152C', '#070A1A']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('admin.user_management')}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.archiveButton}
            onPress={() => navigation.navigate('ArchivedUsers')}
          >
            <Archive size={20} color="#FFFFFF" />
            <Text style={styles.archiveText}>{t('admin.archive')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Image
              source={require('../../Assets/images/exit.png')}
              style={styles.exitIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={users}
        renderItem={renderUserCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF3B6D"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('admin.no_users_found')}</Text>
          </View>
        }
      />

      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalIconContainer}>
                <Trash2 size={24} color="#FF3B6D" />
              </View>

              <Text style={styles.modalTitle}>{t('admin.delete_user')}</Text>

              <Text style={styles.modalMessage}>
                {t('admin.delete_user_message').replace('{name}', selectedUser?.name || 'User')}
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                >
                  <Text style={styles.cancelButtonText}>{t('admin.cancel')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
                  onPress={deleteUser}
                  disabled={deleting}
                >
                  {deleting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.deleteButtonText}>{t('admin.delete')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalIconContainer}>
                <Image
                  source={require('../../Assets/images/exit.png')}
                  style={styles.modalExitIcon}
                />
              </View>

              <Text style={styles.modalTitle}>{t('admin.logout')}</Text>

              <Text style={styles.modalMessage}>
                {t('admin.logout_message')}
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text style={styles.cancelButtonText}>{t('admin.cancel')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.logoutButtonModal, loggingOut && styles.logoutButtonDisabled]}
                  onPress={confirmLogout}
                  disabled={loggingOut}
                >
                  {loggingOut ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.logoutButtonText}>{t('admin.logout')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  archiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
  archiveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  incompleteTag: {
    fontSize: 12,
    color: '#FFB74D',
    fontWeight: 'normal',
  },
  userDetails: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 2,
  },
  userGym: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.6,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.6,
  },
  deleteIconButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 59, 109, 0.2)',
    borderRadius: 10,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 320,
  },
  modalContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalExitIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 15,
    justifyContent: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#F2357661',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  emptyContainer: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButtonModal: {
    flex: 1,
    backgroundColor: '#F2357661',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserManagement;
