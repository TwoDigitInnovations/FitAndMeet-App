import React, { useState, useEffect } from 'react';
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
import { RotateCcw, Trash2, ArrowLeft } from 'lucide-react-native';
import apiService from '../../services/apiService';
import { useTranslation } from 'react-i18next';

const ArchivedUsers = ({ navigation }) => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchDeletedUsers();
  }, []);

  const fetchDeletedUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.GetApi('api/admin/users/deleted');
      
      if (response.success) {
        setUsers(response.users);
      }
    } catch (error) {
      console.error('Error fetching deleted users:', error);
      Alert.alert('Error', 'Failed to load archived users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRestoreUser = (userId, userName) => {
    setSelectedUser({ id: userId, name: userName });
    setShowRestoreModal(true);
  };

  const restoreUser = async () => {
    if (!selectedUser || restoring) return;

    try {
      setRestoring(true);
      const response = await apiService.Put(`api/admin/users/${selectedUser.id}/restore`);
      
      if (response.success) {
        setUsers(users.filter(user => user._id !== selectedUser.id));
        setShowRestoreModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error restoring user:', error);
      Alert.alert('Error', 'Failed to restore user');
    } finally {
      setRestoring(false);
    }
  };

  const handlePermanentDelete = (userId, userName) => {
    setSelectedUser({ id: userId, name: userName });
    setShowDeleteModal(true);
  };

  const permanentDeleteUser = async () => {
    if (!selectedUser || deleting) return;

    try {
      setDeleting(true);
      const response = await apiService.Delete(`api/admin/users/${selectedUser.id}/permanent`);
      
      if (response.success) {
        setUsers(users.filter(user => user._id !== selectedUser.id));
        setShowDeleteModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error permanently deleting user:', error);
      Alert.alert('Error', 'Failed to permanently delete user');
    } finally {
      setDeleting(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDeletedUsers();
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
        <Text style={styles.userName}>{item.firstName}</Text>
        <Text style={styles.userDetails}>
          {item.age} • {item.gender}
        </Text>
        <Text style={styles.userGym}>{item.gymName}</Text>
        <Text style={styles.deletedDate}>
          Deleted: {new Date(item.deletedAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={() => handleRestoreUser(item._id, item.firstName)}
        >
          <RotateCcw size={18} color="#00FF00" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handlePermanentDelete(item._id, item.firstName)}
        >
          <Trash2 size={18} color="#FF3B6D" />
        </TouchableOpacity>
      </View>
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('admin.archived_users')}</Text>
        <View style={{ width: 40 }} />
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
            <Text style={styles.emptyText}>{t('admin.no_archived_users')}</Text>
          </View>
        }
      />

      <Modal
        visible={showRestoreModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRestoreModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalIconContainer}>
                <RotateCcw size={24} color="#00FF00" />
              </View>

              <Text style={styles.modalTitle}>{t('admin.restore_user')}</Text>

              <Text style={styles.modalMessage}>
                {t('admin.restore_user_message').replace('{name}', selectedUser?.name || 'User')}
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowRestoreModal(false);
                    setSelectedUser(null);
                  }}
                >
                  <Text style={styles.cancelButtonText}>{t('admin.cancel')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.restoreButtonModal, restoring && styles.restoreButtonDisabled]}
                  onPress={restoreUser}
                  disabled={restoring}
                >
                  {restoring ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.restoreButtonText}>{t('admin.restore')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

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

              <Text style={styles.modalTitle}>{t('admin.permanent_delete')}</Text>

              <Text style={styles.modalMessage}>
                {t('admin.permanent_delete_message').replace('{name}', selectedUser?.name || 'User')}
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
                  style={[styles.deleteButtonModal, deleting && styles.deleteButtonDisabled]}
                  onPress={permanentDeleteUser}
                  disabled={deleting}
                >
                  {deleting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.deleteButtonText}>{t('admin.delete_forever')}</Text>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    opacity: 0.7,
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
  deletedDate: {
    fontSize: 11,
    color: '#FF3B6D',
    opacity: 0.8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  restoreButton: {
    padding: 12,
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    borderRadius: 12,
  },
  deleteButton: {
    padding: 12,
    backgroundColor: 'rgba(255, 59, 109, 0.2)',
    borderRadius: 12,
  },
  emptyContainer: {
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
  restoreButtonModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 255, 0, 0.3)',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00FF00',
  },
  restoreButtonDisabled: {
    opacity: 0.6,
  },
  restoreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonModal: {
    flex: 1,
    backgroundColor: '#F2357661',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ArchivedUsers;
