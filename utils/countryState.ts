import { Country, ICountry, IState, State } from 'country-state-city';

const TOP_COUNTRY_ISO_CODES = ['US', 'CA'] as const;

/** All countries with US and Canada listed first (matches CCC-Web interest form). */
export function getCountryOptions(): ICountry[] {
    const allCountries = Country.getAllCountries();
    const topCountries = allCountries.filter((country) =>
        TOP_COUNTRY_ISO_CODES.includes(country.isoCode as (typeof TOP_COUNTRY_ISO_CODES)[number])
    );
    const remainingCountries = allCountries.filter(
        (country) =>
            !TOP_COUNTRY_ISO_CODES.includes(country.isoCode as (typeof TOP_COUNTRY_ISO_CODES)[number])
    );
    return [...topCountries, ...remainingCountries];
}

export function findCountryByName(countryName: string): ICountry | undefined {
    const trimmed = countryName.trim().toLowerCase();
    return getCountryOptions().find((c) => c.name.trim().toLowerCase() === trimmed);
}

export function getStateOptionsForCountry(countryName: string): IState[] {
    const selectedCountry = findCountryByName(countryName);
    if (!selectedCountry) return [];
    return State.getStatesOfCountry(selectedCountry.isoCode);
}

export function getStateNamesForCountry(countryName: string): string[] {
    return getStateOptionsForCountry(countryName).map((state) => state.name);
}

export function getDialCodeByCountryName(countryName: string): string {
    const selectedCountry = findCountryByName(countryName);
    if (!selectedCountry?.phonecode) return '';
    return `+${selectedCountry.phonecode.replace(/^\+/, '')}`;
}

export type PhoneCountryOption = {
    id: string;
    name: string;
    dialCode: string;
    minLength: number;
};

const DEFAULT_PHONE_MIN_LENGTH = 7;

/** Map a country name to phone dial-code metadata (matches CCC-Web church phone sync). */
export function getPhoneCountryFromName(countryName?: string | null): PhoneCountryOption | null {
    if (!countryName?.trim()) return null;
    const selectedCountry = findCountryByName(countryName);
    if (!selectedCountry) return null;

    const dialCode = getDialCodeByCountryName(countryName);
    if (!dialCode) return null;

    const minLength =
        selectedCountry.isoCode === 'US' || selectedCountry.isoCode === 'CA'
            ? 10
            : DEFAULT_PHONE_MIN_LENGTH;

    return {
        id: selectedCountry.isoCode,
        name: selectedCountry.name,
        dialCode,
        minLength,
    };
}
