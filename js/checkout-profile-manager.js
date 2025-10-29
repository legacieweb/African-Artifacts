/**
 * 🛒 Checkout Profile Manager
 * Handles asking users to save profile details entered during checkout
 */

let originalUserData = null;
let currentUserData = null;

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
    name: (document.getElementById('first-name')?.value || '' + ' ' + document.getElementById('last-name')?.value || '').trim(),
    phone: document.getElementById('phone')?.value || '',
    address: {
      street: document.getElementById('address')?.value || '',
      city: document.getElementById('city')?.value || '',
      state: document.getElementById('state')?.value || '',
      country: document.getElementById('country')?.value || '',
      zipCode: document.getElementById('zip')?.value || ''
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

async function showProfileSaveModal(onConfirm, onCancel) {
  // Create modal HTML
  const modalHTML = `
    <div id="profileSaveModal" class="profile-save-modal-overlay" onclick="if(event.target.id === 'profileSaveModal') closeProfileSaveModal()">
      <div class="profile-save-modal">
        <div class="profile-save-modal-header">
          <h2>💾 Save Your Details?</h2>
          <button type="button" class="profile-save-modal-close" onclick="closeProfileSaveModal()">×</button>
        </div>
        <div class="profile-save-modal-body">
          <p>We noticed you've entered some information. Would you like us to save these details to your profile for faster checkout next time?</p>
          
          <div class="profile-save-preview">
            <h4>Details to Save:</h4>
            ${isNewUser() ? '<p style="color: #6B8E23; font-weight: 600;">✓ This will be your first saved address</p>' : ''}
            <div class="profile-save-preview-item">
              <span class="profile-save-label">Name:</span>
              <span class="profile-save-value">${document.getElementById('first-name')?.value} ${document.getElementById('last-name')?.value}</span>
            </div>
            <div class="profile-save-preview-item">
              <span class="profile-save-label">Phone:</span>
              <span class="profile-save-value">${document.getElementById('phone')?.value}</span>
            </div>
            <div class="profile-save-preview-item">
              <span class="profile-save-label">Address:</span>
              <span class="profile-save-value">${document.getElementById('address')?.value}</span>
            </div>
            <div class="profile-save-preview-item">
              <span class="profile-save-label">City:</span>
              <span class="profile-save-value">${document.getElementById('city')?.value}</span>
            </div>
            <div class="profile-save-preview-item">
              <span class="profile-save-label">Country:</span>
              <span class="profile-save-value">${document.getElementById('country')?.value}</span>
            </div>
          </div>
        </div>
        <div class="profile-save-modal-footer">
          <button type="button" class="profile-save-btn-secondary" onclick="closeProfileSaveModal()">Skip for Now</button>
          <button type="button" class="profile-save-btn-primary" onclick="confirmProfileSave()">Yes, Save to Profile</button>
        </div>
      </div>
    </div>
  `;

  // Inject modal into DOM
  if (document.getElementById('profileSaveModal')) {
    document.getElementById('profileSaveModal').remove();
  }
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Add styles if not already present
  if (!document.getElementById('profileSaveModalStyles')) {
    const styles = `
      <style id="profileSaveModalStyles">
        .profile-save-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 1rem;
          animation: fadeInOverlay 0.3s ease;
        }

        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .profile-save-modal {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUpModal 0.3s ease;
        }

        @keyframes slideUpModal {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .profile-save-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 2px solid #E8D4B8;
          background: linear-gradient(135deg, #f5e6d3 0%, #ecd2b4 100%);
          border-radius: 16px 16px 0 0;
        }

        .profile-save-modal-header h2 {
          margin: 0;
          font-size: 1.3rem;
          color: #6B4423;
        }

        .profile-save-modal-close {
          background: none;
          border: none;
          font-size: 1.8rem;
          cursor: pointer;
          color: #6B4423;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .profile-save-modal-close:hover {
          color: #E8722C;
        }

        .profile-save-modal-body {
          padding: 1.5rem;
        }

        .profile-save-modal-body > p {
          color: #666;
          margin: 0 0 1.5rem 0;
          line-height: 1.6;
        }

        .profile-save-preview {
          background: #F5E6D3;
          border: 2px solid #E8D4B8;
          border-radius: 12px;
          padding: 1.2rem;
          margin-bottom: 1.5rem;
        }

        .profile-save-preview h4 {
          margin: 0 0 1rem 0;
          font-size: 0.95rem;
          color: #6B4423;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .profile-save-preview-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(232, 114, 44, 0.2);
        }

        .profile-save-preview-item:last-child {
          border-bottom: none;
        }

        .profile-save-label {
          font-weight: 600;
          color: #6B4423;
          font-size: 0.9rem;
        }

        .profile-save-value {
          color: #2d1810;
          word-break: break-word;
          text-align: right;
        }

        .profile-save-modal-footer {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 2px solid #E8D4B8;
          background: #fafafa;
          border-radius: 0 0 16px 16px;
          justify-content: flex-end;
        }

        .profile-save-btn-primary,
        .profile-save-btn-secondary {
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .profile-save-btn-primary {
          background: linear-gradient(135deg, #E8722C 0%, #D65A1F 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(232, 114, 44, 0.35);
        }

        .profile-save-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(232, 114, 44, 0.45);
        }

        .profile-save-btn-secondary {
          background: #E8D4B8;
          color: #6B4423;
        }

        .profile-save-btn-secondary:hover {
          background: #D4B8A0;
        }

        @media (max-width: 600px) {
          .profile-save-modal {
            max-width: 90%;
            margin: 1rem;
          }

          .profile-save-modal-header {
            padding: 1rem;
          }

          .profile-save-modal-header h2 {
            font-size: 1.1rem;
          }

          .profile-save-modal-body {
            padding: 1rem;
          }

          .profile-save-modal-footer {
            flex-direction: column;
          }

          .profile-save-btn-primary,
          .profile-save-btn-secondary {
            width: 100%;
          }
        }
      </style>
    `;
    document.head.insertAdjacentHTML('beforeend', styles);
  }

  // Store callbacks
  window.profileSaveCallbacks = { onConfirm, onCancel };
}

function closeProfileSaveModal() {
  const modal = document.getElementById('profileSaveModal');
  if (modal) {
    modal.remove();
  }
  if (window.profileSaveCallbacks?.onCancel) {
    window.profileSaveCallbacks.onCancel();
  }
}

async function confirmProfileSave() {
  try {
    const formData = captureCheckoutFormData();
    const result = await updateUserProfile({
      name: formData.name,
      phone: formData.phone,
      address: formData.address
    });

    if (!result.error) {
      closeProfileSaveModal();
      showProfileSaveSuccess();
      if (window.profileSaveCallbacks?.onConfirm) {
        window.profileSaveCallbacks.onConfirm();
      }
    } else {
      alert('Error saving profile: ' + result.error);
    }
  } catch (error) {
    console.error('Error saving profile:', error);
    alert('Error saving profile to server');
  }
}

function showProfileSaveSuccess() {
  const successMsg = document.createElement('div');
  successMsg.className = 'profile-save-success';
  successMsg.innerHTML = `
    <div class="profile-save-success-content">
      <span>✓ Profile saved successfully!</span>
    </div>
  `;

  const styles = `
    <style id="profileSaveSuccessStyles">
      .profile-save-success {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10001;
        animation: slideInSuccess 0.4s ease;
      }

      @keyframes slideInSuccess {
        from {
          opacity: 0;
          transform: translateX(100px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .profile-save-success-content {
        background: #52B788;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(82, 183, 136, 0.35);
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      @media (max-width: 600px) {
        .profile-save-success {
          top: 10px;
          right: 10px;
          left: 10px;
        }
      }
    </style>
  `;

  if (!document.getElementById('profileSaveSuccessStyles')) {
    document.head.insertAdjacentHTML('beforeend', styles);
  }

  document.body.appendChild(successMsg);

  setTimeout(() => {
    successMsg.remove();
  }, 3000);
}

// Export for use in checkout
window.checkoutProfileManager = {
  init: initCheckoutProfileManager,
  hasChanged: hasDataChanged,
  isNew: isNewUser,
  showSaveModal: showProfileSaveModal,
  captureData: captureCheckoutFormData,
  closeModal: closeProfileSaveModal
};

console.log('✅ Checkout Profile Manager loaded');