/**
 * Applications model helpers — typed wrappers around Prisma's ApplicationForm and Application operations.
 */
import type { ApplicationForm, Application, Prisma } from '@prisma/client';
export interface FormQuestion {
    id: string;
    label: string;
    type: 'short' | 'long' | 'multiple_choice';
    required: boolean;
    choices?: string[];
}
export declare function createForm(data: {
    guildId: string;
    name: string;
    description?: string;
    questions: FormQuestion[];
    reviewerRoleId?: string;
    logChannelId?: string;
    autoRoleId?: string;
    cooldownHours?: number;
    maxResponses?: number;
    createdBy: string;
}): Promise<ApplicationForm>;
export declare function getForm(guildId: string, name: string): Promise<ApplicationForm | null>;
export declare function listForms(guildId: string): Promise<ApplicationForm[]>;
export declare function updateForm(guildId: string, name: string, data: Prisma.ApplicationFormUpdateInput): Promise<ApplicationForm | null>;
export declare function deleteForm(guildId: string, name: string): Promise<void>;
export declare function submitApplication(data: {
    guildId: string;
    userId: string;
    formId: string;
    formName: string;
    responses: Record<string, string>;
}): Promise<Application>;
export declare function getApplication(id: string): Promise<Application | null>;
export declare function getPendingApplications(guildId: string): Promise<Application[]>;
export declare function reviewApplication(id: string, reviewedBy: string, status: 'accepted' | 'denied', notes?: string): Promise<Application>;
export declare function getUserApplications(userId: string, guildId: string): Promise<Application[]>;
export declare function exportResponses(guildId: string, formName: string): Promise<Application[]>;
//# sourceMappingURL=Applications.d.ts.map