// =============================================================================
// NORD MANIP WEBSITE - CONFIGURATION
// =============================================================================
// Update these values for your specific setup

// Google Sheets Configuration
const SPREADSHEET_ID = '1szsazebfrtAqOYleOhfdo4yLCEYJ29Fn5mmxAADyvSY';  // Just the ID, not the full URL
const API_KEY = 'AIzaSyCQcnj5aiTr5ZAOiV4KYOecurSzw35jLMc';                  // Your Google Sheets API key
const SHEET_NAME = 'Sessions';                        // Name of the sheet/tab in your spreadsheet

// First reading group session configuration
const FIRST_SESSION_DATE = new Date('2026-02-06T14:00:00+01:00'); // Feb 6, 2026, 14:00 CET

// Session duration in minutes (for calendar events)
const SESSION_DURATION_MINUTES = 60;

// =============================================================================
// NEXT SESSION CALCULATION
// =============================================================================

/**
 * Calculates the next biweekly reading group session date
 * @returns {Date} The date of the next session
 */
function getNextSessionDate() {
    const now = new Date();
    const twoWeeksMs = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
    
    // If we're before the first session, return the first session
    if (now < FIRST_SESSION_DATE) {
        return FIRST_SESSION_DATE;
    }
    
    // Calculate how many two-week periods have passed since the first session
    const timeSinceFirst = now - FIRST_SESSION_DATE;
    const periodsPassed = Math.floor(timeSinceFirst / twoWeeksMs);
    
    // Calculate the next session date
    const nextSession = new Date(FIRST_SESSION_DATE.getTime() + (periodsPassed + 1) * twoWeeksMs);
    
    return nextSession;
}

/**
 * Updates the next session display on the page
 */
function updateNextSessionDisplay() {
    const nextSession = getNextSessionDate();
    
    // Format the date nicely
    const dateOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const formattedDate = nextSession.toLocaleDateString('en-US', dateOptions);
    
    // Update the DOM elements
    const dateElement = document.getElementById('next-session-date');
    const timeElement = document.getElementById('next-session-time');
    
    if (dateElement) {
        dateElement.textContent = formattedDate;
    }
    
    if (timeElement) {
        timeElement.textContent = '14:00 CET';
    }
}

// =============================================================================
// GOOGLE CALENDAR EXPORT
// =============================================================================

/**
 * Formats a Date object to Google Calendar's required format (YYYYMMDDTHHmmssZ)
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
function formatDateForGoogleCalendar(date) {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Creates a Google Calendar URL for a session
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {string} paperTitle - Title of the paper
 * @param {string} paperLink - Link to the paper (optional)
 * @param {string} presenterName - Name of the presenter (optional)
 * @param {string} presenterInstitution - Institution of the presenter (optional)
 * @returns {string} Google Calendar URL
 */
function createGoogleCalendarUrl(dateString, paperTitle, paperLink, presenterName, presenterInstitution) {
    // Create start time at 14:00 CET (13:00 UTC in winter, 12:00 UTC in summer)
    // We'll use a fixed offset for simplicity - CET is UTC+1
    const startDate = new Date(dateString + 'T14:00:00+01:00');
    const endDate = new Date(startDate.getTime() + SESSION_DURATION_MINUTES * 60 * 1000);
    
    const title = `NordManip Reading Group: ${paperTitle}`;
    
    let description = 'Nordic Robotic Manipulation Network - Biweekly Reading Group\n\n';
    description += `Paper: ${paperTitle}\n`;
    if (paperLink) {
        description += `Link: ${paperLink}\n`;
    }
    if (presenterName) {
        description += `\nPresenter: ${presenterName}`;
        if (presenterInstitution) {
            description += ` (${presenterInstitution})`;
        }
    }
    description += '\n\nJoin via Zoom (link will be shared with network members)';
    
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        dates: `${formatDateForGoogleCalendar(startDate)}/${formatDateForGoogleCalendar(endDate)}`,
        details: description,
        location: 'Online (Zoom)',
    });
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Opens Google Calendar with pre-filled event details
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {string} paperTitle - Title of the paper
 * @param {string} paperLink - Link to the paper (optional)
 * @param {string} presenterName - Name of the presenter (optional)
 * @param {string} presenterInstitution - Institution of the presenter (optional)
 */
function addToGoogleCalendar(dateString, paperTitle, paperLink, presenterName, presenterInstitution) {
    const url = createGoogleCalendarUrl(dateString, paperTitle, paperLink, presenterName, presenterInstitution);
    window.open(url, '_blank', 'noopener,noreferrer');
}

// =============================================================================
// GOOGLE SHEETS API - FETCH SESSIONS
// =============================================================================

/**
 * Fetches session data from Google Sheets
 * @returns {Promise<Array>} Array of session rows from the spreadsheet
 */
async function fetchSessions() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            // Provide more specific error messages
            if (response.status === 403) {
                throw new Error('API key invalid or Google Sheets API not enabled');
            } else if (response.status === 404) {
                throw new Error('Spreadsheet not found or not publicly accessible');
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }
        
        const data = await response.json();
        return data.values || [];
    } catch (error) {
        console.error('Error fetching sessions:', error);
        throw error;
    }
}

/**
 * Formats a date string for display (shorter format for table)
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

/**
 * Checks if a session date is in the future
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {boolean} True if the date is today or in the future
 */
function isUpcoming(dateString) {
    const sessionDate = new Date(dateString + 'T23:59:59');
    const today = new Date();
    return sessionDate >= today;
}

/**
 * Renders a single session card
 * @param {Array} session - Session data [date, paperTitle, paperLink, presenterName, presenterInstitution]
 * @param {boolean} upcoming - Whether this is an upcoming session
 * @returns {string} HTML string for the session card
 */
function renderSessionCard(session, upcoming) {
    const [date, paperTitle, paperLink, presenterName, presenterInstitution] = session;
    
    // Skip empty rows
    if (!date || !paperTitle) return '';
    
    const calendarButton = upcoming ? `
        <button class="calendar-btn" onclick="addToGoogleCalendar('${date}', '${paperTitle.replace(/'/g, "\\'")}', '${(paperLink || '').replace(/'/g, "\\'")}', '${(presenterName || '').replace(/'/g, "\\'")}', '${(presenterInstitution || '').replace(/'/g, "\\'")}')" title="Add to Google Calendar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
        </button>
    ` : '';
    
    return `
        <div class="session-card ${upcoming ? 'upcoming' : 'past'}">
            <div class="session-date">
                ${formatDate(date)}
                ${upcoming ? '<span class="upcoming-badge">Upcoming</span>' : ''}
            </div>
            <div class="session-paper">
                ${paperLink ? 
                    `<a href="${paperLink}" target="_blank" rel="noopener noreferrer">${paperTitle}</a>` : 
                    paperTitle
                }
            </div>
            <div class="session-presenter">${presenterName || 'TBA'}</div>
            <div class="session-institution">${presenterInstitution || ''}</div>
            <div class="session-actions">${calendarButton}</div>
        </div>
    `;
}

/**
 * Renders all sessions to the page, with upcoming sessions on top
 * @param {Array} sessions - Array of session data from Google Sheets
 */
function renderSessions(sessions) {
    const container = document.getElementById('sessions-list');
    
    if (!container) {
        console.error('Sessions list container not found');
        return;
    }
    
    // Skip the header row (index 0)
    const sessionData = sessions.slice(1);
    
    if (sessionData.length === 0) {
        container.innerHTML = `
            <div class="error-message">
                <p>No sessions scheduled yet. Check back soon!</p>
            </div>
        `;
        return;
    }
    
    // Separate upcoming and past sessions
    const upcomingSessions = sessionData.filter(s => s[0] && isUpcoming(s[0]));
    const pastSessions = sessionData.filter(s => s[0] && !isUpcoming(s[0]));
    
    // Sort upcoming by date ascending (soonest first)
    upcomingSessions.sort((a, b) => new Date(a[0]) - new Date(b[0]));
    
    // Sort past by date descending (most recent first)
    pastSessions.sort((a, b) => new Date(b[0]) - new Date(a[0]));
    
    let html = '';
    
    // Render upcoming sessions
    if (upcomingSessions.length > 0) {
        html += '<div class="sessions-group upcoming-group">';
        html += '<h4 class="sessions-group-title">Upcoming Sessions</h4>';
        html += upcomingSessions.map(s => renderSessionCard(s, true)).join('');
        html += '</div>';
    }
    
    // Render past sessions
    if (pastSessions.length > 0) {
        html += '<div class="sessions-group past-group">';
        html += '<h4 class="sessions-group-title">Past Sessions</h4>';
        html += pastSessions.map(s => renderSessionCard(s, false)).join('');
        html += '</div>';
    }
    
    container.innerHTML = html || '<div class="error-message"><p>No sessions to display</p></div>';
}

/**
 * Loads and displays all sessions
 */
async function loadSessions() {
    const container = document.getElementById('sessions-list');
    
    if (!container) {
        console.error('Sessions list container not found');
        return;
    }
    
    try {
        container.innerHTML = '<div class="loading-message">Loading sessions...</div>';
        const sessions = await fetchSessions();
        renderSessions(sessions);
    } catch (error) {
        console.error('Failed to load sessions:', error);
        container.innerHTML = `
            <div class="error-message">
                <p>Unable to load sessions at this time.</p>
                <p style="font-size: 0.85rem; margin-top: 1rem; opacity: 0.7;">
                    ${error.message}
                </p>
                <p style="font-size: 0.85rem; margin-top: 0.5rem;">
                    Please check the setup guide or contact the administrator.
                </p>
            </div>
        `;
    }
}

// =============================================================================
// MODAL FUNCTIONALITY
// =============================================================================

/**
 * Opens the signup modal
 */
function openModal() {
    const modal = document.getElementById('signup-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Closes the signup modal
 */
function closeModal() {
    const modal = document.getElementById('signup-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize all dynamic features when the page loads
 */
document.addEventListener('DOMContentLoaded', function() {
    // Update next session date
    updateNextSessionDisplay();
    
    // Load sessions from Google Sheets
    loadSessions();
    
    // Set up modal event listeners
    const modal = document.getElementById('signup-modal');
    
    // Close modal when clicking outside
    if (modal) {
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal();
            }
        });
    }
    
    // Close modal on escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
    
    console.log('NordManip website features initialized');
    console.log('Next session:', getNextSessionDate().toDateString());
});

// Make functions globally available for onclick handlers
window.openModal = openModal;
window.closeModal = closeModal;
window.addToGoogleCalendar = addToGoogleCalendar;
