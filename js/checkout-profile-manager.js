/**
 * 🛒 Checkout Profile Manager
 * Handles asking users to save profile details entered during checkout
 */

let originalUserData = null;

async function initCheckoutProfileManager() {
  const token = localStorage.getItem('authToken');
  if (!token) return;

  try {
    const user = await getUserProfile();
    if (user && !user.error) {
      originalUserData = JSON.parse(JSON.stringify(user));
    }
  } catch (error) {
    console.error('Error initializing profile manager:', error);
  }
}

function captureCheckoutFormData() {
  return {
    name: ((document.getElementById('firstName')?.value || '') + ' ' + (document.getElementById('lastName')?.value || '')).trim(),
    phone: document.getElementById('phone')?.value || '',
    address: {
      street: document.getElementById('address')?.value || '',
      city: document.getElementById('city')?.value || '',
      state: document.getElementById('county')?.value || '',
      country: document.getElementById('country')?.value || '',
      zipCode: document.getElementById('zipCode')?.value || ''
    }
  };
}

function hasDataChanged() {
  if (!originalUserData) return false;

  const checkoutData = captureCheckoutFormData();

  // Check if name changed
  if (originalUserData.name !== checkoutData.name) return true;

  // Check if phone changed
  if ((originalUserData.phone || '') !== checkoutData.phone) return true;

  // Check if address changed
  const origAddr = originalUserData.address || {};
  const checkAddr = checkoutData.address || {};

  return (
    (origAddr.street || '') !== checkAddr.street ||
    (origAddr.city || '') !== checkAddr.city ||
    (origAddr.state || '') !== checkAddr.state ||
    (origAddr.country || '') !== checkAddr.country ||
    (origAddr.zipCode || '') !== checkAddr.zipCode
  );
}

function isNewUser() {
  // If user has no address saved, they're considered new for address purposes
  return !originalUserData || !originalUserData.address || !originalUserData.address.street;
}

function showProfileSaveModal(onConfirm, onCancel) {
  const data = captureCheckoutFormData();
  
  const content = `
    <div class="profile-save-preview" style="background: rgba(201, 169, 98, 0.05); border: 1px solid rgba(201, 169, 98, 0.2); border-radius: 12px; padding: 1.2rem; margin-bottom: 1.5rem;">
      <h4 style="margin: 0 0 1rem 0; font-size: 0.95rem; color: #c9a962; text-transform: uppercase;">Details to Save:</h4>
      ${isNewUser() ? '<p style="color: #22c55e; font-weight: 600; font-size: 0.9rem; margin-bottom: 10px;">✓ This will be your first saved address</p>' : ''}
      <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
        <span style="color: #888;">Name:</span>
        <span style="color: #fff;">${data.name}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
        <span style="color: #888;">Phone:</span>
        <span style="color: #fff;">${data.phone}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
        <span style="color: #888;">City:</span>
        <span style="color: #fff;">${data.address.city}</span>
      </div>
    </div>
  `;

  showPopup({
    title: '💾 Save Your Details?',
    subtitle: "We noticed you've entered some information. Would you like us to save these details to your profile for faster checkout next time?",
    content: content,
    confirmText: 'Yes, Save to Profile',
    cancelText: 'Skip for Now',
    onConfirm: () => confirmProfileSave(onConfirm)
  });
  
  // Handle cancel callback if provided
  const overlay = document.getElementById('globalPopupOverlay');
  const oldHide = window.hidePopup;
  window.hidePopup = function() {
    if (onCancel) onCancel();
    oldHide();
    window.hidePopup = oldHide; // Restore
  };
}

async function confirmProfileSave(onConfirm) {
  const btn = document.querySelector('.popup-btn-primary');
  try {
    if (btn) setLoading(btn, true);
    const formData = captureCheckoutFormData();
    const result = await updateUserProfile({
      name: formData.name,
      phone: formData.phone,
      address: formData.address
    });

    if (!result.error) {
      hidePopup();
      showToast('Profile Updated', 'Your details have been saved for next time!', 'success');
      if (onConfirm) onConfirm();
    } else {
      showToast('Error', result.error, 'error');
    }
  } catch (error) {
    console.error('Error saving profile:', error);
    showToast('Error', 'Failed to save profile information', 'error');
  } finally {
    if (btn) setLoading(btn, false);
  }
}

// Export for use in checkout
window.checkoutProfileManager = {
  init: initCheckoutProfileManager,
  hasChanged: hasDataChanged,
  isNew: isNewUser,
  showSaveModal: showProfileSaveModal,
  captureData: captureCheckoutFormData
};

console.log('✅ Checkout Profile Manager loaded');
