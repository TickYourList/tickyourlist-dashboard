// helper.js

/**
 * Get Bootstrap validation class for a Formik field.
 * Adds `is-invalid` class if the field has been touched and has an error.
 */
export const getFieldClass = (fieldName, touched, errors) => {
  return touched[fieldName] && errors[fieldName] ? "is-invalid" : "";
};

/**
 * Get class for a URL slug input.
 * Returns "is-invalid" if slug exists but is an empty string.
 */
export const getSlugInputClass = (slugsEntered, lang) => {
  return slugsEntered[lang] && slugsEntered[lang].trim() === ""
    ? "is-invalid"
    : "";
};

/**
 * Format city select options from city list.
 * Handles null safety for country code.
 */
export const formatCityOptions = (cities) => {
  return Array.isArray(cities)
    ? cities.map((city) => ({
        value: city.cityCode,
        label: `${city.cityCode} (${city.country?.code || "N/A"})`,
      }))
    : [];
};
