// ===== CONFIGURATION =====
const CONFIG = {
    eventName: 'East Meets West',
    eventDate: '15-17 October 2026',
    eventLocation: 'Cape Town, South Africa',
    currency: 'R',
    reservationTimeout: 600000, // 10 minutes in milliseconds
};

// ===== PACKAGES =====
const PACKAGES = [
    {
        id: 'R100K',
        name: 'Platinum VIP',
        price: 100000,
        capacity: 10,
        features: [
            '10 VIP Tags',
            'R97K Bar Tab',
            'Premium Reserved Seating',
            'Allocated Waiter',
            'Allocated Runners',
            'Allocated VIP Security',
            'VIP Parking'
        ],
        sections: ['A1', 'A2', 'A3', 'A4', 'A5']
    },
    {
        id: 'R50K',
        name: 'Gold VIP',
        price: 50000,
        capacity: 8,
        features: [
            '8 VIP Tags',
            'R47.6K Bar Tab',
            'Premium Reserved Seating',
            'Allocated Waiter',
            'Allocated Runners',
            'VIP Parking'
        ],
        sections: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10']
    },
    {
        id: 'R30K',
        name: 'Silver VIP',
        price: 30000,
        capacity: 6,
        features: [
            '6 VIP Tags',
            'R28K Bar Tab',
            'Premium Reserved Seating',
            'Allocated Waiter'
        ],
        sections: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'C11', 'C12', 'C13', 'C14', 'C15']
    },
    {
        id: 'R15K',
        name: 'Bronze VIP',
        price: 15000,
        capacity: 5,
        features: [
            '5 VIP Tags',
            'R13.5K Bar Tab',
            'Reserved Seating',
            'Allocated Waiter'
        ],
        sections: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13', 'D14', 'D15', 'D16', 'D17', 'D18', 'D19', 'D20']
    }
];

// ===== GENERATE SECTIONS =====
function generateSections() {
    const sections = [];
    let idCounter = 1;
    
    PACKAGES.forEach(pkg => {
        pkg.sections.forEach(sectionLabel => {
            // Randomly assign some as sold for demo
            const statuses = ['available', 'available', 'available', 'available', 'sold', 'available', 'available'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            sections.push({
                id: 'sec-' + String(idCounter++),
                label: sectionLabel,
                packageId: pkg.id,
                packageName: pkg.name,
                price: pkg.price,
                capacity: pkg.capacity,
                status: status,
                customer: null,
                bookingRef: null,
                reservedAt: null
            });
        });
    });
    
    return sections;
}

// ===== SAMPLE BOOKINGS =====
function generateSampleBookings(sections) {
    const soldSections = sections.filter(s => s.status === 'sold');
    const customers = [
        { name: 'John Smith', email: 'john@email.com', phone: '071 234 5678' },
        { name: 'Sarah Mokoena', email: 'sarah@email.com', phone: '072 345 6789' },
        { name: 'Thabo Nkosi', email: 'thabo@email.com', phone: '073 456 7890' },
        { name: 'Emily Chen', email: 'emily@email.com', phone: '074 567 8901' },
        { name: 'Mohammed Ali', email: 'mohammed@email.com', phone: '075 678 9012' },
        { name: 'Lisa van der Merwe', email: 'lisa@email.com', phone: '076 789 0123' },
        { name: 'David Okafor', email: 'david@email.com', phone: '077 890 1234' },
        { name: 'Priya Naidoo', email: 'priya@email.com', phone: '078 901 2345' },
        { name: 'James Wilson', email: 'james@email.com', phone: '079 012 3456' },
        { name: 'Amara Obi', email: 'amara@email.com', phone: '071 123 4567' }
    ];
    
    const bookings = [];
    let refCounter = 1;
    
    soldSections.forEach((section, index) => {
        const customer = customers[index % customers.length];
        const booking = {
            id: 'EMW-2026-' + String(refCounter++).padStart(4, '0'),
            sectionId: section.id,
            sectionLabel: section.label,
            packageId: section.packageId,
            packageName: section.packageName,
            price: section.price,
            capacity: section.capacity,
            customer: {
                name: customer.name,
                email: customer.email,
                phone: customer.phone
            },
            guests: section.capacity,
            status: 'paid',
            paymentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            bookingDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        section.customer = customer;
        section.bookingRef = booking.id;
        bookings.push(booking);
    });
    
    return bookings;
}

// ===== INITIALIZE DATA =====
let sections = generateSections();
let bookings = generateSampleBookings(sections);
let selectedPackage = null;
let selectedSection = null;

// ===== DATA HELPERS =====
function getSectionsByPackage(packageId) {
    return sections.filter(s => s.packageId === packageId);
}

function getAvailableSectionsByPackage(packageId) {
    return sections.filter(s => s.packageId === packageId && s.status === 'available');
}

function getPackageById(id) {
    return PACKAGES.find(p => p.id === id);
}

function getSectionById(id) {
    return sections.find(s => s.id === id);
}

function getBookings() {
    return bookings;
}

function getBookingBySectionId(sectionId) {
    return bookings.find(b => b.sectionId === sectionId);
}

function getStats() {
    const total = sections.length;
    const sold = sections.filter(s => s.status === 'sold').length;
    const reserved = sections.filter(s => s.status === 'reserved').length;
    const available = sections.filter(s => s.status === 'available').length;
    const revenue = bookings.reduce((sum, b) => sum + b.price, 0);
    
    return { total, sold, reserved, available, revenue };
}

// ===== RESERVE SECTION =====
function reserveSection(sectionId, customerDetails) {
    const section = getSectionById(sectionId);
    if (!section || section.status !== 'available') {
        return { success: false, message: 'Section not available' };
    }
    
    const pkg = getPackageById(section.packageId);
    if (!pkg) {
        return { success: false, message: 'Package not found' };
    }
    
    const booking = {
        id: 'EMW-2026-' + String(bookings.length + 1).padStart(4, '0'),
        sectionId: section.id,
        sectionLabel: section.label,
        packageId: section.packageId,
        packageName: section.packageName,
        price: section.price,
        capacity: section.capacity,
        customer: {
            name: customerDetails.name || 'Guest',
            email: customerDetails.email || 'guest@email.com',
            phone: customerDetails.phone || 'N/A'
        },
        guests: section.capacity,
        status: 'pending',
        paymentDate: null,
        bookingDate: new Date().toISOString()
    };
    
    section.status = 'reserved';
    section.customer = booking.customer;
    section.bookingRef = booking.id;
    section.reservedAt = Date.now();
    
    bookings.push(booking);
    
    return { success: true, booking: booking };
}

// ===== CONFIRM BOOKING =====
function confirmBooking(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found' };
    
    const section = getSectionById(booking.sectionId);
    if (!section) return { success: false, message: 'Section not found' };
    
    section.status = 'sold';
    booking.status = 'paid';
    booking.paymentDate = new Date().toISOString();
    
    return { success: true, booking: booking };
}

// ===== RELEASE RESERVATION =====
function releaseReservation(sectionId) {
    const section = getSectionById(sectionId);
    if (!section || section.status !== 'reserved') return;
    
    section.status = 'available';
    section.customer = null;
    section.bookingRef = null;
    section.reservedAt = null;
    
    const bookingIndex = bookings.findIndex(b => b.sectionId === sectionId && b.status === 'pending');
    if (bookingIndex !== -1) {
        bookings.splice(bookingIndex, 1);
    }
}

// ===== CHECK EXPIRED RESERVATIONS =====
function checkExpiredReservations() {
    const now = Date.now();
    sections.forEach(section => {
        if (section.status === 'reserved' && section.reservedAt) {
            if (now - section.reservedAt > CONFIG.reservationTimeout) {
                releaseReservation(section.id);
            }
        }
    });
}

setInterval(checkExpiredReservations, 30000);

// ===== EXPORT =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG: CONFIG,
        PACKAGES: PACKAGES,
        sections: sections,
        bookings: bookings,
        selectedPackage: selectedPackage,
        selectedSection: selectedSection,
        getSectionsByPackage: getSectionsByPackage,
        getAvailableSectionsByPackage: getAvailableSectionsByPackage,
        getPackageById: getPackageById,
        getSectionById: getSectionById,
        getBookings: getBookings,
        getBookingBySectionId: getBookingBySectionId,
        getStats: getStats,
        reserveSection: reserveSection,
        confirmBooking: confirmBooking,
        releaseReservation: releaseReservation,
        checkExpiredReservations: checkExpiredReservations
    };
}
