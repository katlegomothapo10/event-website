// ===== ADMIN STATE =====
var adminBookings = [];
var filteredBookings = [];

// ===== DOM REFERENCES =====
var adminVenueMap = document.getElementById('adminVenueMap');
var bookingsTableBody = document.getElementById('bookingsTableBody');
var searchInput = document.getElementById('searchBookings');
var filterPackage = document.getElementById('filterPackage');
var filterStatus = document.getElementById('filterStatus');
var detailModal = document.getElementById('bookingDetailModal');
var detailModalBody = document.getElementById('detailModalBody');
var detailModalClose = document.getElementById('detailModalClose');
var detailModalCloseBtn = document.getElementById('detailModalCloseBtn');
var logoutBtn = document.getElementById('logoutBtn');
var refreshBtn = document.getElementById('refreshAdminBtn');
var exportBtn = document.getElementById('exportCSVBtn');

// ===== RENDER STATS =====
function renderStats() {
    var stats = getStats();
    
    document.getElementById('totalSections').textContent = stats.total;
    document.getElementById('soldSections').textContent = stats.sold;
    document.getElementById('availableSections').textContent = stats.available;
    document.getElementById('reservedSections').textContent = stats.reserved;
    document.getElementById('totalRevenue').textContent = CONFIG.currency + stats.revenue.toLocaleString();
}

// ===== RENDER ADMIN VENUE =====
function renderAdminVenue() {
    adminVenueMap.innerHTML = '';
    
    var allSections = sections.slice();
    var packageOrder = ['R100K', 'R50K', 'R30K', 'R15K'];
    allSections.sort(function(a, b) {
        return packageOrder.indexOf(a.packageId) - packageOrder.indexOf(b.packageId);
    });
    
    allSections.forEach(function(section) {
        var div = document.createElement('div');
        div.className = 'venue-section-item ' + section.status;
        div.setAttribute('data-section-id', section.id);
        
        var customerText = '';
        var statusIcon = '';
        
        if (section.status === 'available') {
            statusIcon = '●';
        } else if (section.status === 'reserved') {
            statusIcon = '◉';
        } else if (section.status === 'sold') {
            statusIcon = '●';
            if (section.customer) {
                customerText = section.customer.name;
            }
        }
        
        div.innerHTML = 
            '<div class="section-label">' + section.label + '</div>' +
            '<div class="section-package">' + section.packageId + '</div>' +
            '<div class="section-capacity">' + section.capacity + ' guests</div>' +
            (customerText ? '<div class="section-customer">' + customerText + '</div>' : '') +
            '<div style="font-size:0.7rem;margin-top:4px;' + 
                (section.status === 'available' ? 'color:#2ecc71;' : '') +
                (section.status === 'reserved' ? 'color:#f39c12;' : '') +
                (section.status === 'sold' ? 'color:#e74c3c;' : '') +
            '">' + statusIcon + ' ' + section.status.toUpperCase() + '</div>';
        
        if (section.status === 'sold' || section.status === 'reserved') {
            div.style.cursor = 'pointer';
            div.addEventListener('click', function() {
                var booking = getBookingBySectionId(this.getAttribute('data-section-id'));
                if (booking) {
                    openBookingDetail(booking);
                }
            });
        }
        
        adminVenueMap.appendChild(div);
    });
}

// ===== RENDER BOOKINGS TABLE =====
function renderBookingsTable(bookingsToShow) {
    var data = bookingsToShow || getBookings();
    filteredBookings = data;
    
    if (data.length === 0) {
        bookingsTableBody.innerHTML = 
            '<tr><td colspan="7" style="text-align:center;padding:40px 0;color:rgba(255,255,255,0.3);">No bookings found</td></tr>';
        return;
    }
    
    bookingsTableBody.innerHTML = data.map(function(booking) {
        return '<tr>' +
            '<td><strong style="color:var(--gold);">' + booking.id + '</strong></td>' +
            '<td>' + booking.customer.name + '</td>' +
            '<td>' + booking.packageId + '</td>' +
            '<td><span style="color:var(--gold);font-weight:600;">' + booking.sectionLabel + '</span></td>' +
            '<td>' + booking.guests + '</td>' +
            '<td><span class="status-badge ' + booking.status + '">' + 
                (booking.status === 'paid' ? 'Paid' : 'Pending') +
            '</span></td>' +
            '<td><button class="btn-secondary" style="padding:4px 12px;font-size:0.7rem;" data-booking="' + booking.id + '">View</button></td>' +
        '</tr>';
    }).join('');
    
    document.querySelectorAll('[data-booking]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var booking = getBookings().find(function(b) { return b.id === this.getAttribute('data-booking'); }.bind(this));
            if (booking) {
                openBookingDetail(booking);
            }
        });
    });
}

// ===== OPEN BOOKING DETAIL =====
function openBookingDetail(booking) {
    var section = getSectionById(booking.sectionId);
    
    detailModalBody.innerHTML = 
        '<div class="detail-row">' +
            '<span class="label">Booking Reference</span>' +
            '<span class="value gold">' + booking.id + '</span>' +
        '</div>' +
        '<div class="detail-row">' +
            '<span class="label">Customer</span>' +
            '<span class="value">' + booking.customer.name + '</span>' +
        '</div>' +
        '<div class="detail-row">' +
            '<span class="label">Email</span>' +
            '<span class="value">' + booking.customer.email + '</span>' +
        '</div>' +
        '<div class="detail-row">' +
            '<span class="label">Phone</span>' +
            '<span class="value">' + booking.customer.phone + '</span>' +
        '</div>' +
        '<div class="detail-row">' +
            '<span class="label">Package</span>' +
            '<span class="value">' + booking.packageName + ' (' + booking.packageId + ')</span>' +
        '</div>' +
        '<div class="detail-row">' +
            '<span class="label">Section</span>' +
            '<span class="value gold">' + booking.sectionLabel + '</span>' +
        '</div>' +
        '<div class="detail-row">' +
            '<span class="label">Capacity</span>' +
            '<span class="value">' + booking.guests + ' guests</span>' +
        '</div>' +
        '<div class="detail-row">' +
            '<span class="label">Total Price</span>' +
            '<span class="value gold">' + CONFIG.currency + booking.price.toLocaleString() + '</span>' +
        '</div>' +
        '<div class="detail-row">' +
            '<span class="label">Status</span>' +
            '<span class="value"><span class="status-badge ' + booking.status + '">' + 
                (booking.status === 'paid' ? 'Paid' : 'Pending') +
            '</span></span>' +
        '</div>' +
        '<div class="detail-row">' +
            '<span class="label">Booking Date</span>' +
            '<span class="value">' + new Date(booking.bookingDate).toLocaleDateString() + '</span>' +
        '</div>' +
        (booking.paymentDate ? 
        '<div class="detail-row">' +
            '<span class="label">Payment Date</span>' +
            '<span class="value">' + new Date(booking.paymentDate).toLocaleDateString() + '</span>' +
        '</div>' : '') +
        (section && section.status === 'sold' ? 
        '<div class="detail-row" style="border-top:2px solid rgba(201,168,76,0.2);padding-top:16px;margin-top:8px;">' +
            '<span class="label">Section Status</span>' +
            '<span class="value" style="color:#2ecc71;">Confirmed</span>' +
        '</div>' : '') +
        (section && section.status === 'reserved' ? 
        '<div class="detail-row" style="border-top:2px solid rgba(201,168,76,0.2);padding-top:16px;margin-top:8px;">' +
            '<span class="label">Section Status</span>' +
            '<span class="value" style="color:#f39c12;">Reserved (Pending Payment)</span>' +
        '</div>' +
        '<div style="margin-top:12px;">' +
            '<button class="btn-primary" id="adminConfirmPayment" style="width:100%;padding:10px;">' +
                'Confirm Payment & Complete Booking' +
            '</button>' +
        '</div>' : '');
    
    detailModal.classList.add('active');
    
    var confirmBtn = document.getElementById('adminConfirmPayment');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            if (confirm('Confirm payment for ' + booking.id + '?')) {
                var result = confirmBooking(booking.id);
                if (result.success) {
                    alert('Booking confirmed successfully');
                    detailModal.classList.remove('active');
                    renderAdminVenue();
                    renderBookingsTable();
                    renderStats();
                }
            }
        });
    }
}

// ===== FILTER BOOKINGS =====
function filterBookings() {
    var search = searchInput.value.toLowerCase().trim();
    var pkg = filterPackage.value;
    var status = filterStatus.value;
    
    var filtered = getBookings();
    
    if (search) {
        filtered = filtered.filter(function(b) {
            return b.id.toLowerCase().includes(search) ||
                b.customer.name.toLowerCase().includes(search) ||
                b.customer.email.toLowerCase().includes(search) ||
                b.sectionLabel.toLowerCase().includes(search);
        });
    }
    
    if (pkg !== 'all') {
        filtered = filtered.filter(function(b) { return b.packageId === pkg; });
    }
    
    if (status !== 'all') {
        filtered = filtered.filter(function(b) { return b.status === status; });
    }
    
    renderBookingsTable(filtered);
}

// ===== CLOSE DETAIL MODAL =====
function closeDetailModal() {
    detailModal.classList.remove('active');
}

detailModalClose.addEventListener('click', closeDetailModal);
detailModalCloseBtn.addEventListener('click', closeDetailModal);

window.addEventListener('click', function(e) {
    if (e.target === detailModal) closeDetailModal();
});

// ===== SEARCH & FILTER EVENTS =====
searchInput.addEventListener('input', filterBookings);
filterPackage.addEventListener('change', filterBookings);
filterStatus.addEventListener('change', filterBookings);

// ===== REFRESH =====
refreshBtn.addEventListener('click', function() {
    renderStats();
    renderAdminVenue();
    filterBookings();
    alert('Dashboard refreshed');
});

// ===== EXPORT CSV =====
exportBtn.addEventListener('click', function() {
    var bookings = getBookings();
    if (bookings.length === 0) {
        alert('No bookings to export');
        return;
    }
    
    var headers = ['Booking ID', 'Customer', 'Email', 'Phone', 'Package', 'Section', 'Guests', 'Status', 'Total', 'Date'];
    var rows = bookings.map(function(b) {
        return [
            b.id,
            b.customer.name,
            b.customer.email,
            b.customer.phone,
            b.packageId,
            b.sectionLabel,
            b.guests,
            b.status.toUpperCase(),
            CONFIG.currency + b.price.toLocaleString(),
            new Date(b.bookingDate).toLocaleDateString()
        ];
    });
    
    var csvContent = headers.join(',') + '\n' + rows.map(function(row) {
        return row.join(',');
    }).join('\n');
    
    var blob = new Blob([csvContent], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'east-meets-west-bookings-' + new Date().toISOString().split('T')[0] + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// ===== LOGOUT =====
logoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = 'index.html';
    }
});

// ===== AUTO-REFRESH =====
setInterval(function() {
    checkExpiredReservations();
    renderStats();
    renderAdminVenue();
    filterBookings();
}, 30000);

// ===== INIT =====
renderStats();
renderAdminVenue();
renderBookingsTable();

console.log('East Meets West - Admin Dashboard');
console.log('Stats:', getStats());
console.log('Bookings:', getBookings().length);
