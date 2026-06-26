import type { Extra } from './types';

/** Separates section path segments from the leaf field name in form/API keys. */
export const EXTRA_FIELD_KEY_SEP = '::';

export function buildExtraFieldKey(
    fieldPath: readonly string[],
    fieldName: string,
): string {
    const path = fieldPath
        .map((segment) => String(segment ?? '').trim())
        .filter(Boolean);
    const name = String(fieldName ?? '').trim();
    if (!path.length) return name;
    return [...path, name].join(EXTRA_FIELD_KEY_SEP);
}

export function buildSectionCheckboxKey(
    fieldPath: readonly string[],
    sectionName: string,
    checkboxName: string,
): string {
    return buildExtraFieldKey(fieldPath, `${sectionName}-cb-${checkboxName}`);
}

export type FlatExtraField = {
    extra: Extra;
    fieldKey: string;
    fieldPath: string[];
};

/** Walk SECTION trees and return leaf fields with stable scoped keys. */
export function flattenExtraFields(
    extras: Extra[],
    parentPath: string[] = [],
): FlatExtraField[] {
    const out: FlatExtraField[] = [];

    for (const extra of extras) {
        if (extra.type === 'SECTION') {
            const sectionPath = [...parentPath, extra.name];
            if (extra.sections?.length) {
                out.push(...flattenExtraFields(extra.sections, sectionPath));
            }
            continue;
        }

        out.push({
            extra,
            fieldKey: buildExtraFieldKey(parentPath, extra.name),
            fieldPath: [...parentPath],
        });
    }

    return out;
}

export function findExtraByFieldKey(
    extras: Extra[],
    fieldKey: string,
): Extra | undefined {
    return flattenExtraFields(extras).find((item) => item.fieldKey === fieldKey)?.extra;
}

/** Default DATE_PICKER values using scoped keys. */
export function seedDefaultFormValues(extras: Extra[]): Record<string, unknown> {
    const values: Record<string, unknown> = {};

    const walk = (list: Extra[], path: string[]) => {
        for (const extra of list) {
            if (extra.type === 'SECTION') {
                if (extra.sections?.length) {
                    walk(extra.sections, [...path, extra.name]);
                }
                continue;
            }

            if (extra.type === 'DATE_PICKER' && extra.date) {
                values[buildExtraFieldKey(path, extra.name)] = extra.date;
            }
        }
    };

    walk(extras, []);
    return values;
}

/**
 * Map saved extras rows onto scoped form keys.
 * Supports legacy unqualified names by assigning duplicates in order to matching sections.
 */
export function mapSavedExtrasToFormValues(
    savedItems: any[] | null | undefined,
    templateExtras: Extra[],
): Record<string, unknown> {
    const values: Record<string, unknown> = {};
    if (!Array.isArray(savedItems)) return values;

    const flatFields = flattenExtraFields(templateExtras);
    const usedKeys = new Set<string>();

    for (const item of savedItems) {
        if (!item?.name || item.type === 'JUMPSTART_COMPLETE') continue;

        const rawName = String(item.name);
        const value =
            item.type === 'SIGNATURE' && item.signatureData != null
                ? item.signatureData
                : item.value;

        if (value === undefined) continue;

        if (rawName.includes(EXTRA_FIELD_KEY_SEP)) {
            values[rawName] = value;
            usedKeys.add(rawName);
            continue;
        }

        const candidates = flatFields.filter((field) => field.extra.name === rawName);
        const target =
            candidates.find((field) => !usedKeys.has(field.fieldKey)) ?? candidates[0];

        if (!target) {
            values[rawName] = value;
            usedKeys.add(rawName);
            continue;
        }

        values[target.fieldKey] = value;
        usedKeys.add(target.fieldKey);
    }

    return values;
}
