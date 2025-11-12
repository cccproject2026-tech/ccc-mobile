import { InterestItem } from '@/types/interest.types';
import { Interest } from '@/components/director/InterestCard';
import { MicrograntApplication } from '@/types/grant.type';

/**
 * Maps API InterestItem to component Interest format
 */
export const mapInterestItemToInterest = (item: InterestItem): Interest => {
    const name = [item.firstName, item.lastName].filter(Boolean).join(' ') || 'Unknown';
    const role = item.title || 'N/A';
    
    // Since API doesn't provide time, we'll use a placeholder
    // You can enhance this later if the API adds a createdAt timestamp
    const time = 'Recently';

    return {
        id: item.id,
        name,
        role,
        time,
        profileImage: undefined, // API doesn't provide profile images yet
    };
};

/**
 * Maps API InterestItem to Interest with status (for micro-grant)
 */
export const mapInterestItemToInterestWithStatus = (
    item: InterestItem,
    status: 'new' | 'pending' | 'approved' = 'new'
): Interest & { status: 'new' | 'pending' | 'approved' } => {
    const base = mapInterestItemToInterest(item);
    return {
        ...base,
        status,
    };
};

/**
 * Maps MicrograntApplication to Interest format
 */
export const mapMicrograntApplicationToInterest = (
    application: MicrograntApplication
): Interest & { status: 'new' | 'pending' | 'approved' } => {
    // Extract name from answers or use email as fallback
    const churchName = application.answers['Church Name'] as string || '';
    const purpose = application.answers['Purpose of Grant'] as string || '';
    const name = churchName || application.userId?.email || 'Unknown';
    
    // Use purpose as role, or form title
    const role = purpose || application.formId.title || 'Micro Grant Application';
    
    // Format time from createdAt
    const createdAt = new Date(application.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    let time = 'Recently';
    if (diffDays === 0) {
        time = 'Today';
    } else if (diffDays === 1) {
        time = 'Yesterday';
    } else if (diffDays < 7) {
        time = `${diffDays} days ago`;
    } else {
        time = createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    // Map status from API to component status
    let status: 'new' | 'pending' | 'approved' = 'new';
    if (application.status === 'new') {
        status = 'new';
    } else if (application.status === 'pending' || application.status === 'under_review') {
        status = 'pending';
    } else if (application.status === 'approved') {
        status = 'approved';
    }

    return {
        id: application._id,
        name,
        role,
        time,
        profileImage: undefined,
        status,
    };
};

