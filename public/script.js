import { db, ref, set, update, remove, onValue } from './firebase.js';

// DOM Elements
const elements = {
    rfidInput: document.getElementById('rfid'),
    nameInput: document.getElementById('name'),
    phoneInput: document.getElementById('phone'),
    pointsInput: document.getElementById('points'),
    addBtn: document.getElementById('addBtn'),
    updateBtn: document.getElementById('updateBtn'),
    deleteBtn: document.getElementById('deleteBtn'),
    clearBtn: document.getElementById('clearBtn'),
    searchInput: document.getElementById('search'),
    searchBtn: document.getElementById('searchBtn'),
    membersList: document.getElementById('membersList'),
    previewRfid: document.getElementById('previewRfid'),
    previewName: document.getElementById('previewName'),
    previewPhone: document.getElementById('previewPhone'),
    previewPoints: document.getElementById('previewPoints'),
    memberSince: document.getElementById('memberSince')
};

// State
let selectedMember = null;

// Initialize the application
function init() {
    initEventListeners();
    loadMembers();
    updatePreview(); // Initialize preview with empty values
}

// Event Listeners
function initEventListeners() {
    // Change event for RFID input to handle card scanning
    elements.rfidInput.addEventListener('change', handleRfidScan);
    
    // Input events for form fields to update preview
    elements.rfidInput.addEventListener('input', updatePreview);
    elements.nameInput.addEventListener('input', updatePreview);
    elements.phoneInput.addEventListener('input', updatePreview);
    elements.pointsInput.addEventListener('input', updatePreview);
    
    // Button events
    elements.addBtn.addEventListener('click', addMember);
    elements.updateBtn.addEventListener('click', updateMember);
    elements.deleteBtn.addEventListener('click', deleteMember);
    elements.clearBtn.addEventListener('click', clearForm);
    elements.searchBtn.addEventListener('click', searchMembers);
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchMembers();
    });
}

// Handle RFID Scan
function handleRfidScan() {
    const rfid = elements.rfidInput.value.trim();
    
    // Skip if RFID is empty or just '0'
    if (rfid.length === 0 || rfid === '0') {
        return;
    }
    
    findMemberByRfid(rfid);
}

// Update preview card
function updatePreview() {
    elements.previewRfid.textContent = elements.rfidInput.value || '-';
    elements.previewName.textContent = elements.nameInput.value || '-';
    elements.previewPhone.textContent = elements.phoneInput.value || '-';
    elements.previewPoints.textContent = elements.pointsInput.value || '0';
    
    // Update member since date if available
    if (selectedMember?.createdAt) {
        elements.memberSince.textContent = formatDate(selectedMember.createdAt);
    } else {
        elements.memberSince.textContent = '-';
    }
}

// Firebase Operations
function findMemberByRfid(rfid) {
    const memberRef = ref(db, `members/${rfid}`);
    
    onValue(memberRef, (snapshot) => {
        const member = snapshot.val();
        
        if (member) {
            // Member found
            selectedMember = { rfid, ...member };
            populateForm(member);
            toggleButtons(true);
            showSuccess(`Member ${member.name} ditemukan`);
        } else {
            // New member
            selectedMember = null;
            clearForm(false);
            toggleButtons(false);
            showInfo('RFID tidak terdaftar, silahkan isi data member baru');
        }
        updatePreview();
    }, { onlyOnce: true });
}

function addMember() {
    const memberData = {
        rfid: elements.rfidInput.value.trim(),
        name: elements.nameInput.value.trim(),
        phone: elements.phoneInput.value.trim(),
        points: parseInt(elements.pointsInput.value) || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Validate required fields
    if (!memberData.rfid) {
        showError('RFID tidak boleh kosong');
        elements.rfidInput.focus();
        return;
    }
    
    if (!memberData.name) {
        showError('Nama tidak boleh kosong');
        elements.nameInput.focus();
        return;
    }

    set(ref(db, `members/${memberData.rfid}`), memberData)
        .then(() => {
            showSuccess('Member berhasil ditambahkan');
            clearForm();
            loadMembers(); // Refresh the member list
        })
        .catch((error) => {
            showError('Gagal menambahkan member', error.message);
        });
}

function updateMember() {
    if (!selectedMember) return;
    
    const updates = {
        name: elements.nameInput.value.trim(),
        phone: elements.phoneInput.value.trim(),
        points: parseInt(elements.pointsInput.value) || 0,
        updatedAt: new Date().toISOString()
    };
    
    update(ref(db, `members/${selectedMember.rfid}`), updates)
        .then(() => {
            showSuccess('Member berhasil diperbarui');
            clearForm();
            loadMembers(); // Refresh the member list
        })
        .catch((error) => {
            showError('Gagal memperbarui member', error.message);
        });
}

function deleteMember() {
    if (!selectedMember) return;
    
    Swal.fire({
        title: 'Hapus Member?',
        text: `Anda yakin ingin menghapus ${selectedMember.name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus!'
    }).then((result) => {
        if (result.isConfirmed) {
            remove(ref(db, `members/${selectedMember.rfid}`))
                .then(() => {
                    showSuccess('Member berhasil dihapus');
                    clearForm();
                    loadMembers(); // Refresh the member list
                })
                .catch((error) => {
                    showError('Gagal menghapus member', error.message);
                });
        }
    });
}

// Helper Functions
function populateForm(member) {
    elements.nameInput.value = member.name || '';
    elements.phoneInput.value = member.phone || '';
    elements.pointsInput.value = member.points || 0;
    updatePreview();
}

function clearForm(focusRfid = true) {
    if (focusRfid) {
        elements.rfidInput.value = '';
        elements.rfidInput.focus();
    }
    elements.nameInput.value = '';
    elements.phoneInput.value = '';
    elements.pointsInput.value = '0';
    selectedMember = null;
    toggleButtons(false);
    updatePreview();
}

function toggleButtons(editMode) {
    elements.addBtn.disabled = editMode;
    elements.updateBtn.disabled = !editMode;
    elements.deleteBtn.disabled = !editMode;
}

// UI Feedback Functions
function showSuccess(message) {
    Swal.fire({
        title: 'Sukses!',
        text: message,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
    });
}

function showError(title, message = '') {
    Swal.fire({
        title,
        text: message,
        icon: 'error',
        confirmButtonText: 'OK'
    });
}

function showInfo(message) {
    Swal.fire({
        title: 'Info',
        text: message,
        icon: 'info',
        timer: 2000,
        showConfirmButton: false
    });
}

// Data Management Functions
function loadMembers() {
    onValue(ref(db, 'members'), (snapshot) => {
        const members = snapshot.val() || {};
        renderMembersList(members);
    }, (error) => {
        showError('Gagal memuat member', error.message);
    });
}

function renderMembersList(members) {
    elements.membersList.innerHTML = '';
    
    if (!members || Object.keys(members).length === 0) {
        elements.membersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users-slash"></i>
                <p>Tidak ada member terdaftar</p>
            </div>
        `;
        return;
    }

    Object.entries(members).forEach(([rfid, member]) => {
        const memberItem = document.createElement('div');
        memberItem.className = 'member-item';
        memberItem.dataset.rfid = rfid;
        memberItem.innerHTML = `
            <div class="member-info">
                <h3>${escapeHtml(member.name)}</h3>
                <p>RFID: ${rfid} | Telp: ${member.phone || '-'} | Poin: ${member.points || 0}</p>
                <small>Bergabung: ${formatDate(member.createdAt)}</small>
            </div>
            <div class="member-actions">
                <button class="edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" title="Hapus"><i class="fas fa-trash"></i></button>
            </div>
        `;
        elements.membersList.appendChild(memberItem);
    });

    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = e.target.closest('.member-item');
            findMemberByRfid(item.dataset.rfid);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = e.target.closest('.member-item');
            const rfid = item.dataset.rfid;
            selectedMember = { rfid, ...members[rfid] };
            deleteMember();
        });
    });
}

function searchMembers() {
    const query = elements.searchInput.value.trim().toLowerCase();
    if (!query) return loadMembers();

    onValue(ref(db, 'members'), (snapshot) => {
        const allMembers = snapshot.val() || {};
        const filtered = Object.entries(allMembers)
            .filter(([rfid, member]) => 
                member.name?.toLowerCase().includes(query) ||
                member.phone?.includes(query) ||
                rfid.includes(query)
            )
            .reduce((acc, [rfid, member]) => ({ ...acc, [rfid]: member }), {});

        renderMembersList(filtered);
    }, (error) => {
        showError('Gagal mencari member', error.message);
    });
}

// Utility Functions
function escapeHtml(unsafe) {
    return unsafe?.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;") || '';
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Start the application
init();