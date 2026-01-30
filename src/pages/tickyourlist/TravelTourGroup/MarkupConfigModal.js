/**
 * ========================================
 * ENHANCED MARKUP CONFIGURATION MODAL
 * ========================================
 * 
 * Production-level modal for managing provider markup configurations
 * Features:
 * - Multiple markup configs per variant
 * - Support for all providers (Klook, Bokun, Ventrata, etc.)
 * - Priority management with reordering (up/down buttons)
 * - Hierarchical configuration (VARIANT → PRODUCT → PROVIDER → GLOBAL)
 * - Rule-based conditions
 * 
 * ========================================
 */

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Row,
    Col,
    Label,
    Input,
    Spinner,
    Card,
    CardBody,
    Table,
    Badge,
    Alert,
    FormGroup,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
    UncontrolledTooltip,
} from "reactstrap";
import classnames from "classnames";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";
import {
    fetchMarkupConfigsRequest,
    upsertMarkupConfigRequest,
    updateMarkupConfigRequest,
    deleteMarkupConfigRequest,
    reorderMarkupConfigsRequest,
    fetchTourGroupsRequest,
    fetchVariantsByTourRequest,
    fetchKlookLivePricingRequest,
} from "store/tickyourlist/travelTourGroup/action";
import { getAllMarkupConfigsForVariant } from "helpers/location_management_helper";

// All supported providers
const PROVIDERS = [
    { value: "KLOOK_AGENT", label: "Klook Agent" },
    { value: "KLOOK_OCTO", label: "Klook Octo" },
    { value: "BOKUN", label: "Bokun" },
    { value: "BOKUN_OCTO", label: "Bokun Octo" },
    { value: "VENTRATA", label: "Ventrata" },
    { value: "REZDY", label: "Rezdy" },
    { value: "REZDY_OCTO", label: "Rezdy Octo" },
    { value: "OCTO_NATIVE", label: "Octo Native" },
];

const MarkupConfigModal = ({
    isOpen,
    toggle,
    provider = null, // null = show all providers
    tourGroupId = null,
    variantId = null,
    level = "VARIANT", // GLOBAL, PROVIDER, PRODUCT, VARIANT
}) => {
    const dispatch = useDispatch();
    const {
        markupConfigs,
        markupConfigsLoading,
        upsertingMarkupConfig,
        updatingMarkupConfig,
        deletingMarkupConfig,
        allTourGroups,
        variantsByTour,
        klookLivePricing,
        klookLivePricingLoading,
    } = useSelector((state) => ({
        markupConfigs: state.tourGroup?.markupConfigs || [],
        markupConfigsLoading: state.tourGroup?.markupConfigsLoading || false,
        upsertingMarkupConfig: state.tourGroup?.upsertingMarkupConfig || false,
        updatingMarkupConfig: state.tourGroup?.updatingMarkupConfig || false,
        deletingMarkupConfig: state.tourGroup?.deletingMarkupConfig || false,
        allTourGroups: state.tourGroup?.tourGroup || [],
        variantsByTour: state.tourGroup?.variantsByTour || [],
        klookLivePricing: state.tourGroup?.klookLivePricing || {},
        klookLivePricingLoading: state.tourGroup?.klookLivePricingLoading || false,
    }));

    const [activeTab, setActiveTab] = useState("list");
    const [editingConfig, setEditingConfig] = useState(null);
    const [selectedProvider, setSelectedProvider] = useState(provider || "KLOOK_AGENT");
    const [allVariantConfigs, setAllVariantConfigs] = useState(null); // For variant level: all configs across providers
    const [loadingAllConfigs, setLoadingAllConfigs] = useState(false);
    const [reordering, setReordering] = useState(false);

    // Product and Variant selection states
    const [tourGroups, setTourGroups] = useState([]);
    const [variants, setVariants] = useState([]);
    const [selectedTourGroup, setSelectedTourGroup] = useState(tourGroupId || null);
    const [selectedVariant, setSelectedVariant] = useState(variantId || null);
    const [applyToAllVariants, setApplyToAllVariants] = useState(false);
    const [loadingTourGroups, setLoadingTourGroups] = useState(false);
    const [loadingVariants, setLoadingVariants] = useState(false);

    // Actual pricing data for preview
    const [actualPricing, setActualPricing] = useState({
        b2bPrice: null,
        originalPrice: null,
        liveSellingPrice: null,
        currency: "USD",
        cityCurrency: null,
        cityCurrencySymbol: null,
        inrRate: null,
        cityRate: null,
        loading: false,
    });

    // Selected currency for display
    const [selectedDisplayCurrency, setSelectedDisplayCurrency] = useState("USD");

    // Currency list with symbols
    const currencyList = [
        { code: "USD", symbol: "$", name: "US Dollar" },
        { code: "INR", symbol: "₹", name: "Indian Rupee" },
        { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
        { code: "EUR", symbol: "€", name: "Euro" },
        { code: "GBP", symbol: "£", name: "British Pound" },
        { code: "SAR", symbol: "ر.س", name: "Saudi Riyal" },
        { code: "QAR", symbol: "ر.ق", name: "Qatari Riyal" },
        { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar" },
        { code: "OMR", symbol: "ر.ع", name: "Omani Rial" },
        { code: "BHD", symbol: ".د.ب", name: "Bahraini Dinar" },
        { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
        { code: "AUD", symbol: "A$", name: "Australian Dollar" },
        { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
        { code: "JPY", symbol: "¥", name: "Japanese Yen" },
        { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
        { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
        { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
        { code: "THB", symbol: "฿", name: "Thai Baht" },
        { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
        { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
        { code: "PHP", symbol: "₱", name: "Philippine Peso" },
        { code: "VND", symbol: "₫", name: "Vietnamese Dong" },
        { code: "KRW", symbol: "₩", name: "South Korean Won" },
        { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
        { code: "ZAR", symbol: "R", name: "South African Rand" },
        { code: "BRL", symbol: "R$", name: "Brazilian Real" },
        { code: "MXN", symbol: "$", name: "Mexican Peso" },
        { code: "ARS", symbol: "$", name: "Argentine Peso" },
        { code: "CLP", symbol: "$", name: "Chilean Peso" },
        { code: "COP", symbol: "$", name: "Colombian Peso" },
        { code: "PEN", symbol: "S/", name: "Peruvian Sol" },
        { code: "TRY", symbol: "₺", name: "Turkish Lira" },
        { code: "RUB", symbol: "₽", name: "Russian Ruble" },
        { code: "ILS", symbol: "₪", name: "Israeli Shekel" },
        { code: "EGP", symbol: "ج.م", name: "Egyptian Pound" },
        { code: "JOD", symbol: "د.أ", name: "Jordanian Dinar" },
        { code: "LBP", symbol: "ل.ل", name: "Lebanese Pound" },
        { code: "PKR", symbol: "₨", name: "Pakistani Rupee" },
        { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },
        { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee" },
        { code: "NPR", symbol: "Rs", name: "Nepalese Rupee" },
        { code: "MMK", symbol: "K", name: "Myanmar Kyat" },
        { code: "KHR", symbol: "៛", name: "Cambodian Riel" },
        { code: "LAK", symbol: "₭", name: "Lao Kip" },
    ];

    const [formData, setFormData] = useState({
        level: level,
        provider: selectedProvider,
        tourGroupId: tourGroupId,
        variantId: variantId,
        tag: "default",
        name: "",
        description: "",
        priority: 50,
        markupConfig: {
            type: "PERCENTAGE",
            value: 20,
            priceSource: "B2B_PRICE",
            customPrice: undefined,
            currency: "USD",
            roundingRule: "NONE",
            minPrice: undefined,
            maxPrice: undefined,
        },
        isActive: true,
        isDefault: false,
    });

    // Fetch variant details to get tour group ID
    const fetchVariantDetails = async (vId) => {
        try {
            const { getTourGroupVariantDetailAPI } = await import('helpers/location_management_helper');
            const response = await getTourGroupVariantDetailAPI(vId);
            const variant = response?.data?.variant || response?.data;
            if (variant?.productId) {
                const tgId = variant.productId._id || variant.productId;
                setSelectedTourGroup(tgId);
                setFormData(prev => ({ ...prev, tourGroupId: tgId, variantId: vId }));
            }
        } catch (error) {
            console.error("Error fetching variant details:", error);
        }
    };

    // Initialize tour group and variant from props when modal opens
    useEffect(() => {
        if (isOpen) {
            if (tourGroupId) {
                setSelectedTourGroup(tourGroupId);
            }
            if (variantId) {
                setSelectedVariant(variantId);
                // If variantId is provided but no tourGroupId, fetch variant to get tourGroupId
                if (!tourGroupId && variantId) {
                    fetchVariantDetails(variantId);
                }
            }
        }
    }, [isOpen, tourGroupId, variantId]);

    // Fetch tour groups when modal opens
    useEffect(() => {
        if (isOpen && level !== "GLOBAL") {
            fetchTourGroups();
        }
    }, [isOpen, level]);

    // Fetch variants when tour group is selected or when modal opens with tourGroupId
    useEffect(() => {
        if (selectedTourGroup && level !== "GLOBAL" && level !== "PROVIDER") {
            fetchVariants(selectedTourGroup);
        } else {
            setVariants([]);
        }
    }, [selectedTourGroup, level]);

    // Fetch provider pricing via Redux when variant is selected (same flow as LiveKlookPricing)
    useEffect(() => {
        const variantToUse = selectedVariant || variantId;
        const tourGroupToUse = selectedTourGroup || tourGroupId;

        // Only fetch from API for Klook providers (backend only supports KLOOK_AGENT currently)
        const isKlookProvider = formData.provider === 'KLOOK_AGENT' || formData.provider === 'KLOOK_OCTO';

        if (isOpen && variantToUse && tourGroupToUse && formData.provider && isKlookProvider) {
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            // endDate must be at least next day, but using 30 days range like LiveKlookPricing for better results
            const endDate = new Date(today);
            endDate.setDate(endDate.getDate() + 30); // 30 days range like the working curl example
            const endDateStr = endDate.toISOString().split('T')[0];
            // Use Redux action to fetch pricing (same as LiveKlookPricing component)
            // Always fetch from Klook API - don't skip even if mappings might not exist
            console.log("🔄 Fetching Klook live pricing for markup config:", {
                tourGroupId: tourGroupToUse,
                variantId: variantToUse,
                provider: formData.provider,
                startDate: todayStr,
                endDate: endDateStr
            });
            dispatch(fetchKlookLivePricingRequest(tourGroupToUse, todayStr, endDateStr, variantToUse, 'USD'));
        } else if (isOpen && variantToUse && tourGroupToUse && formData.provider && !isKlookProvider) {
            // For non-Klook providers, we can't fetch live pricing yet
            console.warn("⚠️ Live pricing API only supports Klook providers currently. Provider:", formData.provider);
            setActualPricing(prev => ({ ...prev, loading: false }));
        }
    }, [selectedVariant, variantId, selectedTourGroup, tourGroupId, formData.provider, isOpen, dispatch]);

    // Extract pricing from Redux store when it's available (same structure as LiveKlookPricing uses)
    useEffect(() => {
        const variantToUse = selectedVariant || variantId;
        const tourGroupToUse = selectedTourGroup || tourGroupId;

        if (isOpen && variantToUse && tourGroupToUse && formData.provider) {
            if (klookLivePricingLoading) {
                setActualPricing(prev => ({ ...prev, loading: true }));
                return;
            }

            const pricingData = klookLivePricing[tourGroupToUse];

            console.log("📥 Pricing data from Redux store:", {
                hasPricingData: !!pricingData,
                tourGroupId: tourGroupToUse,
                variantId: variantToUse,
                provider: formData.provider,
                pricingDataKeys: pricingData ? Object.keys(pricingData) : []
            });

            if (pricingData) {
                // Extract pricing from Redux store using same logic as LiveKlookPricing
                extractPricingFromRedux(pricingData, variantToUse, tourGroupToUse);
            } else {
                // If no pricing data, it might mean:
                // 1. API call hasn't completed yet (still loading)
                // 2. API call failed
                // 3. No mappings exist for this variant
                console.warn("⚠️ No pricing data in Redux store. This could mean:");
                console.warn("   1. API call is still in progress");
                console.warn("   2. API call failed (check network tab)");
                console.warn("   3. No provider mappings exist for this variant");
                console.warn("   4. Provider mappings exist but are not active or sync is disabled");
                // Don't set loading to false yet - wait a bit to see if data arrives
                // The loading state will be handled by the extractPricingFromRedux function
            }
        } else if (!isOpen) {
            // Reset pricing when modal closes
            setActualPricing({
                b2bPrice: null,
                originalPrice: null,
                liveSellingPrice: null,
                currency: "USD",
                cityCurrency: null,
                cityCurrencySymbol: null,
                inrRate: null,
                cityRate: null,
                loading: false,
            });
        }
    }, [klookLivePricing, klookLivePricingLoading, selectedVariant, variantId, selectedTourGroup, tourGroupId, formData.provider, isOpen]);

    // Helper function to convert price to selected display currency
    const getConvertedPrice = (price, targetCurrency, pricingData, showSymbol = false) => {
        if (!price || price <= 0) return "0.00";
        if (!targetCurrency || targetCurrency === "USD") {
            return showSymbol ? `$${price.toFixed(2)}` : price.toFixed(2);
        }

        // Get conversion rate
        let conversionRate = 1;

        if (targetCurrency === "INR" && pricingData?.inrRate) {
            conversionRate = pricingData.inrRate;
        } else if (targetCurrency === pricingData?.cityCurrency && pricingData?.cityRate) {
            conversionRate = pricingData.cityRate;
        } else if (targetCurrency !== "USD") {
            // Use approximate rates for other currencies
            const approximateRates = {
                "EUR": 0.92, "GBP": 0.79, "SAR": 3.75, "QAR": 3.64, "KWD": 0.31,
                "OMR": 0.38, "BHD": 0.38, "SGD": 1.34, "AUD": 1.52, "CAD": 1.35,
                "JPY": 150, "CHF": 0.88, "CNY": 7.2, "HKD": 7.8, "THB": 35,
                "MYR": 4.7, "IDR": 15500, "PHP": 55, "VND": 24500, "KRW": 1300,
                "NZD": 1.65, "ZAR": 18.5, "BRL": 4.9, "MXN": 17, "ARS": 850,
                "CLP": 900, "COP": 3900, "PEN": 3.7, "TRY": 32, "RUB": 90,
                "ILS": 3.7, "EGP": 48, "JOD": 0.71, "LBP": 15000, "PKR": 280,
                "BDT": 110, "LKR": 325, "NPR": 133, "MMK": 2100, "KHR": 4100, "LAK": 21000,
                "AED": 3.67, "INR": 83
            };
            conversionRate = approximateRates[targetCurrency] || 1;
        }

        const convertedPrice = price * conversionRate;

        // Get currency symbol
        const currencySymbols = {
            "USD": "$", "EUR": "€", "GBP": "£", "INR": "₹", "AED": "د.إ", "SAR": "﷼",
            "JPY": "¥", "CNY": "¥", "KRW": "₩", "THB": "฿", "SGD": "S$", "AUD": "A$",
            "CAD": "C$", "HKD": "HK$", "NZD": "NZ$", "CHF": "CHF", "SEK": "kr",
            "NOK": "kr", "DKK": "kr", "PLN": "zł", "CZK": "Kč", "HUF": "Ft",
            "RUB": "₽", "TRY": "₺", "BRL": "R$", "MXN": "$", "ZAR": "R"
        };

        const symbol = currencySymbols[targetCurrency] || targetCurrency;

        if (showSymbol) {
            return `${symbol} ${convertedPrice.toFixed(2)}`;
        }

        return convertedPrice.toFixed(2);
    };

    // Extract pricing data from Redux store (same logic as LiveKlookPricing component)
    const extractPricingFromRedux = async (pricingData, variantToFetch, tourGroupToFetch) => {

        console.log("🔵 extractPricingFromRedux: Starting", { variantToFetch, tourGroupToFetch, provider: formData.provider });
        setActualPricing(prev => ({ ...prev, loading: true }));

        try {
            const { getTourGroupVariantDetailAPI } = await import('helpers/location_management_helper');
            const { get } = await import('helpers/api_helper');

            // Get variant details for original price and city info
            const variantResponse = await getTourGroupVariantDetailAPI(variantToFetch);
            const variant = variantResponse?.data?.variant || variantResponse?.data;

            console.log("📦 Variant data received:", {
                hasVariant: !!variant,
                listingPrice: variant?.listingPrice,
                listingPricesInAllCurrencies: variant?.listingPricesInAllCurrencies?.length,
                city: variant?.city,
                cityCode: variant?.cityCode
            });

            // Get city currency from variant
            let cityCurrency = "USD";
            let cityCurrencySymbol = "$";
            if (variant?.city?.country?.currency) {
                cityCurrency = variant.city.country.currency.code || variant.city.country.currency.currencyCode || "USD";
                cityCurrencySymbol = variant.city.country.currency.localSymbol || variant.city.country.currency.symbol || "$";
            } else if (variant?.cityCode) {
                // Fallback: map cityCode to currency (common mappings)
                const cityCurrencyMap = {
                    'DUBAI': 'AED', 'ABU_DHABI': 'AED', 'SHARJAH': 'AED',
                    'RIYADH': 'SAR', 'JEDDAH': 'SAR', 'DAMMAM': 'SAR',
                    'DOHA': 'QAR',
                    'KUWAIT': 'KWD',
                    'MUSCAT': 'OMR',
                    'MANAMA': 'BHD',
                    'MUMBAI': 'INR', 'DELHI': 'INR', 'BANGALORE': 'INR', 'GOA': 'INR',
                    'LONDON': 'GBP', 'PARIS': 'EUR', 'NEW_YORK': 'USD', 'SINGAPORE': 'SGD'
                };
                cityCurrency = cityCurrencyMap[variant.cityCode] || "USD";
            }

            let originalPrice = null;
            let variantCurrency = "USD";

            // Extract original price from variant - try multiple sources
            if (variant?.listingPrice?.prices && variant.listingPrice.prices.length > 0) {
                // Try to get adult/guest price first
                const adultPrice = variant.listingPrice.prices.find(p =>
                    p.type?.toLowerCase() === 'adult' || p.type?.toLowerCase() === 'guest'
                ) || variant.listingPrice.prices[0];
                originalPrice = adultPrice?.originalPrice || adultPrice?.finalPrice;
                variantCurrency = variant.listingPrice.currencyCode || "USD";
            } else if (variant?.listingPricesInAllCurrencies && variant.listingPricesInAllCurrencies.length > 0) {
                // Try USD first, then any currency
                const usdPricing = variant.listingPricesInAllCurrencies.find(p => p.currencyCode === "USD")
                    || variant.listingPricesInAllCurrencies[0];
                if (usdPricing?.prices && usdPricing.prices.length > 0) {
                    const adultPrice = usdPricing.prices.find(p =>
                        p.type?.toLowerCase() === 'adult' || p.type?.toLowerCase() === 'guest'
                    ) || usdPricing.prices[0];
                    originalPrice = adultPrice?.originalPrice || adultPrice?.finalPrice;
                    variantCurrency = usdPricing.currencyCode || "USD";
                }
            }

            console.log("💰 Extracted original price:", { originalPrice, variantCurrency });

            // Get B2B price from Redux store (same structure as LiveKlookPricing uses)
            let b2bPrice = null;
            let liveSellingPrice = null;
            const today = new Date().toISOString().split('T')[0];

            console.log("📊 Pricing data from Redux store:", pricingData);

            if (pricingData?.variants && Array.isArray(pricingData.variants)) {
                console.log("🔍 Found variants in response:", pricingData.variants.length);
                console.log("🔍 All variant IDs in response:", pricingData.variants.map(v => ({
                    variantId: v.variantId || v._id,
                    variantName: v.variantName || v.name,
                    hasSchedules: !!v.schedules
                })));
                console.log("🔍 Looking for variant:", variantToFetch, typeof variantToFetch);

                const variantPricing = pricingData.variants.find(v => {
                    const vId = v.variantId || v._id;
                    // Try multiple matching strategies
                    const matches = vId === variantToFetch ||
                        vId?.toString() === variantToFetch?.toString() ||
                        String(vId) === String(variantToFetch) ||
                        (vId && variantToFetch && String(vId).toLowerCase() === String(variantToFetch).toLowerCase());
                    console.log("🔎 Checking variant match:", {
                        responseVariantId: vId,
                        lookingFor: variantToFetch,
                        typeMatch: typeof vId === typeof variantToFetch,
                        stringMatch: String(vId) === String(variantToFetch),
                        matches
                    });
                    return matches;
                });

                if (variantPricing) {
                    console.log("✅ Found matching variant pricing:", variantPricing);
                    if (variantPricing?.schedules && Array.isArray(variantPricing.schedules)) {
                        // The structure is: schedules -> calendars -> timeslots
                        // Find today's timeslot across all schedules and calendars
                        let todaySlot = null;

                        for (const schedule of variantPricing.schedules) {
                            if (schedule?.calendars && Array.isArray(schedule.calendars)) {
                                for (const calendar of schedule.calendars) {
                                    if (calendar?.timeslots && Array.isArray(calendar.timeslots)) {
                                        // Find today's timeslot
                                        const slot = calendar.timeslots.find(ts => {
                                            if (ts.startTime) {
                                                const slotDate = new Date(ts.startTime).toISOString().split('T')[0];
                                                return slotDate === today;
                                            }
                                            return false;
                                        });

                                        if (slot) {
                                            todaySlot = slot;
                                            break;
                                        }

                                        // If no today's slot found, use first available slot as fallback
                                        if (!todaySlot && calendar.timeslots.length > 0) {
                                            todaySlot = calendar.timeslots[0];
                                        }
                                    }
                                }
                            }

                            if (todaySlot) break;
                        }

                        if (todaySlot) {
                            console.log("⏰ Selected timeslot:", todaySlot);
                            console.log("⏰ Timeslot keys:", Object.keys(todaySlot));
                            console.log("⏰ Full timeslot data:", JSON.stringify(todaySlot, null, 2));
                            // originalPrice is the B2B price from provider (USD) - this is the live price from Klook API
                            // sellingPrice is the B2C price (with markup applied)
                            if (todaySlot.originalPrice !== undefined && todaySlot.originalPrice !== null && todaySlot.originalPrice > 0) {
                                b2bPrice = parseFloat(todaySlot.originalPrice); // This is the actual provider B2B price from Klook API
                                console.log("✅ SUCCESS: Using live provider API B2B price (originalPrice):", b2bPrice);
                            } else if (todaySlot.b2bPrice !== undefined && todaySlot.b2bPrice !== null && todaySlot.b2bPrice > 0) {
                                b2bPrice = parseFloat(todaySlot.b2bPrice);
                                console.log("✅ SUCCESS: Using live provider API B2B price (b2bPrice):", b2bPrice);
                            } else {
                                console.warn("⚠️ WARNING: Timeslot found but no B2B price in originalPrice or b2bPrice fields");
                                console.warn("⚠️ This means the API response doesn't contain the expected price fields");
                                console.warn("⚠️ Available fields:", Object.keys(todaySlot));
                                console.warn("⚠️ Full timeslot:", todaySlot);
                            }
                            // sellingPrice is the B2C price, but we can also use it as live selling price reference
                            if (todaySlot.sellingPrice !== undefined && todaySlot.sellingPrice !== null && todaySlot.sellingPrice > 0) {
                                liveSellingPrice = parseFloat(todaySlot.sellingPrice); // B2C price (with markup)
                            }
                            console.log("💵 Extracted prices:", {
                                b2bPrice,
                                liveSellingPrice,
                                originalPrice: todaySlot.originalPrice,
                                sellingPrice: todaySlot.sellingPrice,
                                b2bPriceField: todaySlot.b2bPrice,
                                allFields: todaySlot
                            });
                        } else {
                            console.log("⚠️ No timeslots found in any calendar");
                            console.log("⚠️ Schedule structure:", variantPricing.schedules.map(s => ({
                                hasCalendars: !!s.calendars,
                                calendarsCount: s.calendars?.length || 0,
                                calendars: s.calendars?.map(c => ({
                                    month: c.month,
                                    hasTimeslots: !!c.timeslots,
                                    timeslotsCount: c.timeslots?.length || 0
                                }))
                            })));
                        }
                    } else {
                        console.log("⚠️ No schedules in variant pricing");
                    }
                } else {
                    console.log("⚠️ No matching variant found in pricing data");
                }
            } else {
                console.log("⚠️ No variants in pricing data, structure:", Object.keys(pricingData || {}));
                // Check if there's an error message about mappings
                if (pricingData?.message && pricingData.message.includes("No active")) {
                    console.error("❌ CRITICAL: Provider mappings not found!");
                    console.error("❌ The API returned:", pricingData.message);
                    console.error("❌ This means:");
                    console.error("   1. No provider mappings exist for this variant/tour group");
                    console.error("   2. OR mappings exist but are not active (isActive = false)");
                    console.error("   3. OR mappings exist but sync is disabled (syncEnabled = false)");
                    console.error("❌ Please check provider mappings and ensure they are active and synced.");
                    console.error("❌ Will try calendar pricing as fallback, but this will use stored prices, not live API prices.");
                }
            }

            // SECONDARY: Try calendar pricing endpoint - this might have more up-to-date prices than variant's stored price
            // We'll try this even if provider API failed, as it might have synced provider prices
            if (!b2bPrice || b2bPrice <= 0) {
                try {
                    const todayPricingResponse = await get(`/v1/variant-calendar-pricing/pricing/${variantToFetch}/${today}?currency=USD`);
                    const todayPricing = todayPricingResponse?.data?.data?.pricing || todayPricingResponse?.data?.pricing;
                    console.log("📅 Today's calendar pricing (fallback):", todayPricing);

                    if (todayPricing?.prices && Array.isArray(todayPricing.prices) && todayPricing.prices.length > 0) {
                        const adultPrice = todayPricing.prices.find(p =>
                            p.type?.toLowerCase() === 'adult' || p.type?.toLowerCase() === 'guest'
                        ) || todayPricing.prices[0];
                        const todayOriginalPrice = adultPrice?.originalPrice || adultPrice?.finalPrice;
                        if (todayOriginalPrice && todayOriginalPrice > 0) {
                            b2bPrice = todayOriginalPrice;
                            variantCurrency = todayPricing.currency || variantCurrency;
                            console.log("✅ Using today's calendar pricing as B2B price (fallback):", b2bPrice);
                        }
                    }
                } catch (error) {
                    console.log("⚠️ Could not fetch today's calendar pricing:", error.message);
                }
            }

            // FINAL FALLBACK: Only use variant's stored price if everything else failed
            // NOTE: This stored price might be outdated. The actual provider B2B price should come from the provider API.
            // If you see this fallback being used, it means:
            // 1. Provider mappings might not be set up correctly
            // 2. The API call might have failed
            // 3. The variant might not be properly mapped to a Klook product
            if (!b2bPrice || b2bPrice <= 0) {
                if (originalPrice && originalPrice > 0) {
                    b2bPrice = originalPrice;
                    console.error("❌ FALLBACK: Using variant's stored price as final fallback B2B price:", b2bPrice);
                    console.error("❌ This means the Klook API did not return a live price.");
                    console.error("❌ Possible reasons:");
                    console.error("   1. Provider mappings are not set up or not active");
                    console.error("   2. The variant is not mapped to a Klook product");
                    console.error("   3. The Klook API call failed or returned no data");
                    console.error("   4. The variant mapping exists but syncEnabled is false");
                    console.error("❌ Please check provider mappings and ensure they are active and synced.");
                } else {
                    console.error("❌ No B2B price found from any source, using placeholder");
                    b2bPrice = 0;
                }
            } else {
                console.log("✅ SUCCESS: Successfully fetched LIVE B2B price from Klook API:", b2bPrice);
                console.log("✅ This is the actual current price from the provider, not a stored fallback.");
            }

            // Get exchange rates for currency conversion
            // Note: Using default rates since currency exchange endpoint doesn't exist
            // These are approximate rates - for accurate rates, use the provider pricing API which includes exchange rates
            let inrRate = 83; // Default USD to INR rate (approximate)
            let cityRate = 1; // Default rate for city currency

            // Use default rates based on common currencies
            // These rates are approximate and should be updated regularly
            const defaultRates = {
                'AED': 3.67, 'SAR': 3.75, 'QAR': 3.64, 'KWD': 0.31, 'OMR': 0.38, 'BHD': 0.38,
                'INR': 83, 'GBP': 0.79, 'EUR': 0.92, 'SGD': 1.34, 'AUD': 1.52, 'CAD': 1.35,
                'JPY': 150, 'CHF': 0.88, 'CNY': 7.2, 'HKD': 7.8, 'THB': 35, 'MYR': 4.7,
                'IDR': 15600, 'PHP': 56, 'VND': 24500, 'KRW': 1330
            };

            if (defaultRates[cityCurrency]) {
                cityRate = defaultRates[cityCurrency];
            }
            if (defaultRates['INR']) {
                inrRate = defaultRates['INR'];
            }

            console.log("💱 Exchange rates (using defaults):", { inrRate, cityRate, cityCurrency });

            console.log("✅ Final pricing data:", {
                b2bPrice,
                originalPrice,
                liveSellingPrice,
                currency: variantCurrency,
                cityCurrency,
                cityCurrencySymbol,
                inrRate,
                cityRate
            });

            setActualPricing({
                b2bPrice,
                originalPrice: originalPrice || b2bPrice, // Use b2bPrice as originalPrice if not set
                liveSellingPrice,
                currency: variantCurrency,
                cityCurrency,
                cityCurrencySymbol,
                inrRate,
                cityRate,
                loading: false,
            });
        } catch (error) {
            console.error("❌ Error fetching actual pricing:", error);
            console.error("Error details:", error.response?.data || error.message);
            setActualPricing(prev => ({ ...prev, loading: false }));
        }
    };

    // Fetch configurations when modal opens
    useEffect(() => {
        if (isOpen) {
            if (level === "VARIANT" && variantId) {
                // Fetch all configs for variant (all providers)
                fetchAllVariantConfigs();
            } else {
                // Fetch configs for specific provider/level
                dispatch(fetchMarkupConfigsRequest(selectedProvider, level, tourGroupId || selectedTourGroup, variantId || selectedVariant, true));
            }
        }
    }, [isOpen, selectedProvider, level, tourGroupId || selectedTourGroup, variantId || selectedVariant, dispatch]);

    // Fetch tour groups
    const fetchTourGroups = async () => {
        try {
            setLoadingTourGroups(true);
            dispatch(fetchTourGroupsRequest({ page: 1, limit: 200 }));
        } catch (error) {
            console.error("Error fetching tour groups:", error);
            showToastError("Failed to fetch tour groups");
        } finally {
            setLoadingTourGroups(false);
        }
    };

    // Fetch variants for selected tour group
    const fetchVariants = async (tgId) => {
        try {
            setLoadingVariants(true);
            dispatch(fetchVariantsByTourRequest(tgId));
        } catch (error) {
            console.error("Error fetching variants:", error);
            showToastError("Failed to fetch variants");
        } finally {
            setLoadingVariants(false);
        }
    };

    // Update tour groups from Redux state
    useEffect(() => {
        if (allTourGroups && Array.isArray(allTourGroups) && allTourGroups.length > 0) {
            setTourGroups(allTourGroups);
        }
    }, [allTourGroups]);

    // Update variants from Redux state
    useEffect(() => {
        if (variantsByTour && Array.isArray(variantsByTour) && variantsByTour.length > 0) {
            setVariants(variantsByTour);
        } else {
            setVariants([]);
        }
    }, [variantsByTour]);

    // Fetch all markup configs for a variant (across all providers)
    const fetchAllVariantConfigs = async () => {
        if (!variantId || !tourGroupId) return;

        setLoadingAllConfigs(true);
        try {
            const response = await getAllMarkupConfigsForVariant(variantId, tourGroupId);
            const data = response?.data?.data || response?.data || response;
            setAllVariantConfigs(data);
        } catch (error) {
            console.error("Error fetching all variant configs:", error);
            showToastError("Failed to fetch markup configurations");
        } finally {
            setLoadingAllConfigs(false);
        }
    };

    // Update formData when selectedProvider changes
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            provider: selectedProvider,
        }));
    }, [selectedProvider]);

    // Reset form when editing config changes
    useEffect(() => {
        if (editingConfig) {
            setFormData({
                level: editingConfig.level || level,
                provider: editingConfig.provider || selectedProvider,
                tourGroupId: editingConfig.tourGroupId || tourGroupId,
                variantId: editingConfig.variantId || variantId,
                tag: editingConfig.tag || "default",
                name: editingConfig.name || "",
                description: editingConfig.description || "",
                priority: editingConfig.priority || 50,
                markupConfig: editingConfig.markupConfig || {
                    type: "PERCENTAGE",
                    value: 20,
                    priceSource: "B2B_PRICE",
                    customPrice: undefined,
                    roundingRule: "NONE",
                },
                isActive: editingConfig.isActive !== undefined ? editingConfig.isActive : true,
                isDefault: editingConfig.isDefault || false,
            });
        } else {
            // Reset to defaults
            setFormData({
                level: level,
                provider: selectedProvider,
                tourGroupId: tourGroupId,
                variantId: variantId,
                tag: "default",
                name: "",
                description: "",
                priority: 50,
                markupConfig: {
                    type: "PERCENTAGE",
                    value: 20,
                    priceSource: "B2B_PRICE",
                    customPrice: undefined,
                    currency: "USD",
                    roundingRule: "NONE",
                    minPrice: undefined,
                    maxPrice: undefined,
                },
                isActive: true,
                isDefault: false,
            });
        }
    }, [editingConfig, level, selectedProvider, tourGroupId, variantId]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith("markupConfig.")) {
            const field = name.split(".")[1];
            setFormData({
                ...formData,
                markupConfig: {
                    ...formData.markupConfig,
                    [field]: type === "checkbox" ? checked : (type === "number" ? parseFloat(value) || 0 : value),
                },
            });
        } else {
            setFormData({
                ...formData,
                [name]: type === "checkbox" ? checked : (type === "number" ? parseFloat(value) || 0 : value),
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation for product/variant selection
        if ((level === "PRODUCT" || level === "VARIANT") && !selectedTourGroup) {
            showToastError("Please select a tour group (product)");
            return;
        }

        if (level === "VARIANT" && !applyToAllVariants && !selectedVariant) {
            showToastError("Please select a variant or check 'Apply to all variants'");
            return;
        }

        // Validation
        if (!formData.tag || !formData.name) {
            showToastError("Tag and Name are required");
            return;
        }

        // Validation based on markup type
        if (formData.markupConfig.type === "NO_MARKUP" || formData.markupConfig.type === "CUSTOM_PRICE") {
            if (formData.markupConfig.type === "CUSTOM_PRICE" && (!formData.markupConfig.customPrice || formData.markupConfig.customPrice <= 0)) {
                showToastError("Custom price must be greater than 0");
                return;
            }
        } else if (!formData.markupConfig.value || formData.markupConfig.value <= 0) {
            showToastError("Markup value must be greater than 0");
            return;
        }

        // Prepare form data with selected tour group and variant
        const submitData = {
            ...formData,
            tourGroupId: selectedTourGroup || formData.tourGroupId || tourGroupId,
            variantId: applyToAllVariants ? null : (selectedVariant || formData.variantId || variantId),
        };

        // If applying to all variants, create configs for each variant
        if (applyToAllVariants && selectedTourGroup && variants.length > 0) {
            const promises = variants.map(variant => {
                const variantConfig = {
                    ...submitData,
                    variantId: variant._id || variant.id,
                };
                return dispatch(upsertMarkupConfigRequest(variantConfig));
            });

            Promise.all(promises).then(() => {
                showToastSuccess(`Markup configuration applied to all ${variants.length} variants`);
                setEditingConfig(null);
                setActiveTab("list");
                setApplyToAllVariants(false);
                setSelectedVariant(null);
                dispatch(fetchMarkupConfigsRequest(selectedProvider, level, selectedTourGroup, null, true));
            }).catch(error => {
                showToastError("Failed to apply markup to some variants");
            });
        } else {
            // Determine if creating or updating
            if (editingConfig?._id) {
                dispatch(updateMarkupConfigRequest(editingConfig._id, submitData));
            } else {
                dispatch(upsertMarkupConfigRequest(submitData));
            }

            // Reset after a delay
            setTimeout(() => {
                setEditingConfig(null);
                setActiveTab("list");
                if (level === "VARIANT" && (variantId || selectedVariant)) {
                    fetchAllVariantConfigs();
                } else {
                    dispatch(fetchMarkupConfigsRequest(selectedProvider, level, selectedTourGroup || tourGroupId, selectedVariant || variantId, true));
                }
            }, 1000);
        }
    };

    const handleEdit = (config) => {
        setEditingConfig(config);
        setSelectedProvider(config.provider || selectedProvider);
        setActiveTab("form");
    };

    const handleDelete = (configId) => {
        if (window.confirm("Are you sure you want to delete this markup configuration?")) {
            dispatch(deleteMarkupConfigRequest(configId));
            setTimeout(() => {
                if (level === "VARIANT" && variantId) {
                    fetchAllVariantConfigs();
                } else {
                    dispatch(fetchMarkupConfigsRequest(selectedProvider, level, tourGroupId, variantId, true));
                }
            }, 500);
        }
    };

    const handleCancel = () => {
        setEditingConfig(null);
        setActiveTab("list");
        setFormData({
            level: level,
            provider: selectedProvider,
            tourGroupId: tourGroupId,
            variantId: variantId,
            tag: "default",
            name: "",
            description: "",
            priority: 50,
            markupConfig: {
                type: "PERCENTAGE",
                value: 20,
                priceSource: "B2B_PRICE",
                customPrice: undefined,
                roundingRule: "NONE",
                minPrice: undefined,
                maxPrice: undefined,
            },
            isActive: true,
            isDefault: false,
        });
    };

    // Handle priority reordering (move up/down)
    const handlePriorityChange = async (configId, direction) => {
        if (reordering) return;

        setReordering(true);
        try {
            // Get current configs
            const currentConfigs = level === "VARIANT" && allVariantConfigs
                ? allVariantConfigs.variantConfigs || []
                : markupConfigs;

            // Sort by priority
            const sorted = [...currentConfigs].sort((a, b) => (b.priority || 0) - (a.priority || 0));
            const currentIndex = sorted.findIndex(c => c._id === configId);

            if (currentIndex === -1) {
                showToastError("Configuration not found");
                return;
            }

            // Calculate new priority
            let newPriority;
            if (direction === "up" && currentIndex > 0) {
                // Swap with previous (higher priority)
                const prevPriority = sorted[currentIndex - 1].priority || 50;
                const currentPriority = sorted[currentIndex].priority || 50;
                newPriority = prevPriority + 1;
            } else if (direction === "down" && currentIndex < sorted.length - 1) {
                // Swap with next (lower priority)
                const nextPriority = sorted[currentIndex + 1].priority || 50;
                const currentPriority = sorted[currentIndex].priority || 50;
                newPriority = Math.max(1, nextPriority - 1);
            } else {
                setReordering(false);
                return; // Can't move further
            }

            // Update priority - format for backend API
            const updates = sorted.map((config, idx) => ({
                _id: config._id,
                priority: config._id === configId ? newPriority : config.priority || 50,
            }));

            // Dispatch action through Redux to handle refresh automatically
            dispatch(reorderMarkupConfigsRequest(
                updates,
                selectedProvider,
                level,
                tourGroupId,
                variantId
            ));
        } catch (error) {
            console.error("Error reordering priorities:", error);
            showToastError("Failed to update priority");
        } finally {
            setReordering(false);
        }
    };

    // Get level display name
    const getLevelDisplayName = (level) => {
        switch (level) {
            case "GLOBAL": return "Global";
            case "PROVIDER": return "Provider";
            case "PRODUCT": return "Product";
            case "VARIANT": return "Variant";
            default: return level;
        }
    };

    // Get markup type display name
    const getMarkupTypeDisplayName = (type) => {
        switch (type) {
            case "PERCENTAGE": return "Percentage";
            case "FIXED_AMOUNT": return "Fixed Amount";
            case "TIERED": return "Tiered";
            case "NO_MARKUP": return "No Markup";
            case "DISCOUNT": return "Discount";
            case "CUSTOM_PRICE": return "Custom Price";
            default: return type;
        }
    };

    // Get provider display name
    const getProviderDisplayName = (providerValue) => {
        const provider = PROVIDERS.find(p => p.value === providerValue);
        return provider ? provider.label : providerValue;
    };

    // Get configurations to display
    const getDisplayConfigs = () => {
        if (level === "VARIANT" && allVariantConfigs) {
            return allVariantConfigs.variantConfigs || [];
        }
        return markupConfigs;
    };

    // Group configs by provider (for variant level)
    const getConfigsByProvider = () => {
        const configs = getDisplayConfigs();
        const grouped = {};

        configs.forEach(config => {
            const prov = config.provider || "UNKNOWN";
            if (!grouped[prov]) {
                grouped[prov] = [];
            }
            grouped[prov].push(config);
        });

        // Sort each group by priority
        Object.keys(grouped).forEach(prov => {
            grouped[prov].sort((a, b) => (b.priority || 0) - (a.priority || 0));
        });

        return grouped;
    };

    const displayConfigs = getDisplayConfigs();
    const configsByProvider = level === "VARIANT" ? getConfigsByProvider() : {};

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="xl">
            <ModalHeader toggle={toggle}>
                Markup Configuration - {getLevelDisplayName(level)}
                {variantId && level === "VARIANT" && " (All Providers)"}
            </ModalHeader>
            <ModalBody>
                {/* Provider Selection (for VARIANT level or when provider is null) */}
                {(level === "VARIANT" || !provider) && (
                    <Card className="mb-3">
                        <CardBody>
                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Provider</Label>
                                        <Input
                                            type="select"
                                            value={selectedProvider}
                                            onChange={(e) => {
                                                setSelectedProvider(e.target.value);
                                                if (level !== "VARIANT") {
                                                    dispatch(fetchMarkupConfigsRequest(e.target.value, level, tourGroupId, variantId, true));
                                                }
                                            }}
                                        >
                                            {PROVIDERS.map(prov => (
                                                <option key={prov.value} value={prov.value}>
                                                    {prov.label}
                                                </option>
                                            ))}
                                        </Input>
                                        <small className="text-muted">
                                            {level === "VARIANT"
                                                ? "Select provider to add new configuration"
                                                : "Select provider to view configurations"}
                                        </small>
                                    </FormGroup>
                                </Col>
                                {level === "VARIANT" && allVariantConfigs && (
                                    <Col md={6}>
                                        <Alert color="info" className="mb-0">
                                            <strong>Available Providers:</strong>{" "}
                                            {allVariantConfigs.providers?.length > 0
                                                ? allVariantConfigs.providers.map(p => getProviderDisplayName(p)).join(", ")
                                                : "None"}
                                        </Alert>
                                    </Col>
                                )}
                            </Row>
                        </CardBody>
                    </Card>
                )}

                <Nav tabs className="nav-tabs-custom">
                    <NavItem>
                        <NavLink
                            className={classnames({ active: activeTab === "list" })}
                            onClick={() => {
                                setActiveTab("list");
                                setEditingConfig(null);
                            }}
                            style={{ cursor: "pointer" }}
                        >
                            <i className="mdi mdi-format-list-bulleted me-1"></i>
                            Configurations ({displayConfigs.length})
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: activeTab === "form" })}
                            onClick={() => setActiveTab("form")}
                            style={{ cursor: "pointer" }}
                        >
                            <i className="mdi mdi-plus-circle me-1"></i>
                            {editingConfig ? "Edit Configuration" : "New Configuration"}
                        </NavLink>
                    </NavItem>
                </Nav>

                <TabContent activeTab={activeTab} className="p-3">
                    <TabPane tabId="list">
                        {(loadingAllConfigs || markupConfigsLoading) ? (
                            <div className="text-center py-4">
                                <Spinner color="primary" />
                                <p className="mt-2">Loading configurations...</p>
                            </div>
                        ) : displayConfigs.length === 0 ? (
                            <Alert color="info">
                                No markup configurations found. Click "New Configuration" to create one.
                            </Alert>
                        ) : level === "VARIANT" && Object.keys(configsByProvider).length > 0 ? (
                            // Variant level: Show grouped by provider
                            <div>
                                {Object.keys(configsByProvider).map(providerKey => (
                                    <Card key={providerKey} className="mb-3">
                                        <CardBody>
                                            <h6 className="mb-3">
                                                <Badge color="primary">{getProviderDisplayName(providerKey)}</Badge>
                                                <span className="ms-2 text-muted">
                                                    ({configsByProvider[providerKey].length} configuration{configsByProvider[providerKey].length !== 1 ? 's' : ''})
                                                </span>
                                            </h6>
                                            <Table responsive size="sm">
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: '40px' }}>Priority</th>
                                                        <th>Tag</th>
                                                        <th>Name</th>
                                                        <th>Type</th>
                                                        <th>Value</th>
                                                        <th>Priority #</th>
                                                        <th>Status</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {configsByProvider[providerKey].map((config, idx) => (
                                                        <tr key={config._id}>
                                                            <td>
                                                                <div className="d-flex flex-column gap-1">
                                                                    <Button
                                                                        color="link"
                                                                        size="sm"
                                                                        className="p-0"
                                                                        onClick={() => handlePriorityChange(config._id, "up")}
                                                                        disabled={reordering || idx === 0}
                                                                        title="Move Up (Increase Priority)"
                                                                    >
                                                                        <i className="mdi mdi-arrow-up"></i>
                                                                    </Button>
                                                                    <Button
                                                                        color="link"
                                                                        size="sm"
                                                                        className="p-0"
                                                                        onClick={() => handlePriorityChange(config._id, "down")}
                                                                        disabled={reordering || idx === configsByProvider[providerKey].length - 1}
                                                                        title="Move Down (Decrease Priority)"
                                                                    >
                                                                        <i className="mdi mdi-arrow-down"></i>
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <Badge color="primary">{config.tag}</Badge>
                                                                {config.isDefault && (
                                                                    <Badge color="success" className="ms-1">Default</Badge>
                                                                )}
                                                            </td>
                                                            <td>{config.name}</td>
                                                            <td>{getMarkupTypeDisplayName(config.markupConfig?.type)}</td>
                                                            <td>
                                                                {config.markupConfig?.type === "PERCENTAGE" ? (
                                                                    <>{config.markupConfig?.value}%</>
                                                                ) : config.markupConfig?.type === "FIXED_AMOUNT" ? (
                                                                    <>{config.markupConfig?.currency || "USD"} {config.markupConfig?.value?.toFixed(2) || "0.00"}</>
                                                                ) : config.markupConfig?.type === "DISCOUNT" ? (
                                                                    <>{config.markupConfig?.value}%</>
                                                                ) : config.markupConfig?.type === "CUSTOM_PRICE" ? (
                                                                    <>{config.markupConfig?.currency || "USD"} {config.markupConfig?.customPrice?.toFixed(2) || "0.00"}</>
                                                                ) : (
                                                                    <>{config.markupConfig?.value || "—"}</>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <Badge color="info">{config.priority}</Badge>
                                                            </td>
                                                            <td>
                                                                {config.isActive ? (
                                                                    <Badge color="success">Active</Badge>
                                                                ) : (
                                                                    <Badge color="secondary">Inactive</Badge>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <Button
                                                                    color="primary"
                                                                    size="sm"
                                                                    className="me-1"
                                                                    onClick={() => handleEdit(config)}
                                                                >
                                                                    <i className="mdi mdi-pencil"></i>
                                                                </Button>
                                                                <Button
                                                                    color="danger"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(config._id)}
                                                                    disabled={deletingMarkupConfig}
                                                                >
                                                                    <i className="mdi mdi-delete"></i>
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            // Other levels: Show simple table
                            <Table responsive size="sm">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px' }}>Priority</th>
                                        <th>Tag</th>
                                        <th>Name</th>
                                        <th>Type</th>
                                        <th>Value</th>
                                        <th>Priority #</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayConfigs
                                        .sort((a, b) => (b.priority || 0) - (a.priority || 0))
                                        .map((config, idx) => (
                                            <tr key={config._id}>
                                                <td>
                                                    <div className="d-flex flex-column gap-1">
                                                        <Button
                                                            color="link"
                                                            size="sm"
                                                            className="p-0"
                                                            onClick={() => handlePriorityChange(config._id, "up")}
                                                            disabled={reordering || idx === 0}
                                                            title="Move Up (Increase Priority)"
                                                        >
                                                            <i className="mdi mdi-arrow-up"></i>
                                                        </Button>
                                                        <Button
                                                            color="link"
                                                            size="sm"
                                                            className="p-0"
                                                            onClick={() => handlePriorityChange(config._id, "down")}
                                                            disabled={reordering || idx === displayConfigs.length - 1}
                                                            title="Move Down (Decrease Priority)"
                                                        >
                                                            <i className="mdi mdi-arrow-down"></i>
                                                        </Button>
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge color="primary">{config.tag}</Badge>
                                                    {config.isDefault && (
                                                        <Badge color="success" className="ms-1">Default</Badge>
                                                    )}
                                                </td>
                                                <td>{config.name}</td>
                                                <td>{getMarkupTypeDisplayName(config.markupConfig?.type)}</td>
                                                <td>
                                                    {config.markupConfig?.type === "PERCENTAGE" ? (
                                                        <>{config.markupConfig?.value}%</>
                                                    ) : config.markupConfig?.type === "FIXED_AMOUNT" ? (
                                                        <>{config.markupConfig?.currency || "USD"} {config.markupConfig?.value?.toFixed(2) || "0.00"}</>
                                                    ) : config.markupConfig?.type === "DISCOUNT" ? (
                                                        <>{config.markupConfig?.value}%</>
                                                    ) : config.markupConfig?.type === "CUSTOM_PRICE" ? (
                                                        <>{config.markupConfig?.currency || "USD"} {config.markupConfig?.customPrice?.toFixed(2) || "0.00"}</>
                                                    ) : (
                                                        <>{config.markupConfig?.value || "—"}</>
                                                    )}
                                                </td>
                                                <td>
                                                    <Badge color="info">{config.priority}</Badge>
                                                </td>
                                                <td>
                                                    {config.isActive ? (
                                                        <Badge color="success">Active</Badge>
                                                    ) : (
                                                        <Badge color="secondary">Inactive</Badge>
                                                    )}
                                                </td>
                                                <td>
                                                    <Button
                                                        color="primary"
                                                        size="sm"
                                                        className="me-1"
                                                        onClick={() => handleEdit(config)}
                                                    >
                                                        <i className="mdi mdi-pencil"></i>
                                                    </Button>
                                                    <Button
                                                        color="danger"
                                                        size="sm"
                                                        onClick={() => handleDelete(config._id)}
                                                        disabled={deletingMarkupConfig}
                                                    >
                                                        <i className="mdi mdi-delete"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </Table>
                        )}
                    </TabPane>

                    <TabPane tabId="form">
                        <form onSubmit={handleSubmit}>
                            {/* Product and Variant Selection - Only show if level is PRODUCT or VARIANT */}
                            {(level === "PRODUCT" || level === "VARIANT") && (
                                <>
                                    <Row>
                                        <Col md={6}>
                                            <FormGroup>
                                                <Label>Tour Group (Product) <span className="text-danger">*</span></Label>
                                                <Select
                                                    isClearable
                                                    isSearchable
                                                    placeholder="Search and select a tour group..."
                                                    options={tourGroups.map(tg => ({
                                                        value: tg._id || tg.id,
                                                        label: tg.name || tg.title || "Unnamed Tour Group"
                                                    }))}
                                                    value={selectedTourGroup ? tourGroups.find(tg => (tg._id || tg.id) === selectedTourGroup) ? {
                                                        value: selectedTourGroup,
                                                        label: tourGroups.find(tg => (tg._id || tg.id) === selectedTourGroup)?.name || tourGroups.find(tg => (tg._id || tg.id) === selectedTourGroup)?.title
                                                    } : null : null}
                                                    onChange={(option) => {
                                                        const tgId = option?.value || null;
                                                        setSelectedTourGroup(tgId);
                                                        setSelectedVariant(null);
                                                        setApplyToAllVariants(false);
                                                        setFormData(prev => ({ ...prev, tourGroupId: tgId, variantId: null }));
                                                    }}
                                                    isDisabled={loadingTourGroups}
                                                    isLoading={loadingTourGroups}
                                                />
                                                <small className="text-muted">Select the tour group (product) for this markup configuration</small>
                                            </FormGroup>
                                        </Col>
                                        {level === "VARIANT" && (
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>
                                                        Variant {!applyToAllVariants && <span className="text-danger">*</span>}
                                                    </Label>
                                                    <Select
                                                        isClearable
                                                        isSearchable
                                                        placeholder={selectedTourGroup ? "Search and select a variant..." : "Select tour group first"}
                                                        options={variants.map(v => ({
                                                            value: v._id || v.id,
                                                            label: v.name || "Unnamed Variant"
                                                        }))}
                                                        value={selectedVariant ? variants.find(v => (v._id || v.id) === selectedVariant) ? {
                                                            value: selectedVariant,
                                                            label: variants.find(v => (v._id || v.id) === selectedVariant)?.name
                                                        } : null : null}
                                                        onChange={(option) => {
                                                            const vId = option?.value || null;
                                                            setSelectedVariant(vId);
                                                            setApplyToAllVariants(false);
                                                            setFormData(prev => ({ ...prev, variantId: vId }));
                                                        }}
                                                        isDisabled={loadingVariants || !selectedTourGroup || applyToAllVariants}
                                                        isLoading={loadingVariants && selectedTourGroup}
                                                    />
                                                    <small className="text-muted">Select a specific variant or apply to all variants below</small>
                                                </FormGroup>
                                            </Col>
                                        )}
                                    </Row>
                                    {level === "VARIANT" && selectedTourGroup && variants.length > 0 && (
                                        <Row>
                                            <Col md={12}>
                                                <FormGroup>
                                                    <Label check>
                                                        <Input
                                                            type="checkbox"
                                                            checked={applyToAllVariants}
                                                            onChange={(e) => {
                                                                const checked = e.target.checked;
                                                                setApplyToAllVariants(checked);
                                                                if (checked) {
                                                                    setSelectedVariant(null);
                                                                    setFormData(prev => ({ ...prev, variantId: null }));
                                                                }
                                                            }}
                                                        />
                                                        {" "}
                                                        Apply markup to all variants of this tour group
                                                    </Label>
                                                    <small className="text-muted d-block mt-1">
                                                        When checked, this markup will be applied to all {variants.length} variants of the selected tour group
                                                    </small>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    )}
                                    <hr className="my-3" />
                                </>
                            )}

                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Provider {level !== "GLOBAL" && <span className="text-danger">*</span>}</Label>
                                        <Input
                                            type="select"
                                            name="provider"
                                            value={formData.provider}
                                            onChange={handleInputChange}
                                            required={level !== "GLOBAL"}
                                            disabled={level === "GLOBAL"}
                                        >
                                            <option value="">Select Provider</option>
                                            {PROVIDERS.map(prov => (
                                                <option key={prov.value} value={prov.value}>
                                                    {prov.label}
                                                </option>
                                            ))}
                                        </Input>
                                        <small className="text-muted">Select the provider for this markup configuration</small>
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Tag <span className="text-danger">*</span></Label>
                                        <Input
                                            type="text"
                                            name="tag"
                                            value={formData.tag}
                                            onChange={handleInputChange}
                                            placeholder="e.g., default, winter_premium, summer_discount"
                                            required
                                        />
                                        <small className="text-muted">Unique identifier for this configuration</small>
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Name <span className="text-danger">*</span></Label>
                                        <Input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Default Klook Markup"
                                            required
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Priority</Label>
                                        <Input
                                            type="number"
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleInputChange}
                                            min={1}
                                            max={100}
                                            required
                                        />
                                        <small className="text-muted">
                                            Higher number = higher priority (1-100). Higher priority configs are evaluated first.
                                        </small>
                                    </FormGroup>
                                </Col>
                            </Row>

                            <FormGroup>
                                <Label>Description</Label>
                                <Input
                                    type="textarea"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Description of this markup configuration"
                                    rows={2}
                                />
                            </FormGroup>

                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Price Source <span className="text-danger">*</span></Label>
                                        <Input
                                            type="select"
                                            name="markupConfig.priceSource"
                                            value={formData.markupConfig.priceSource || "B2B_PRICE"}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="B2B_PRICE">B2B Price (Provider Wholesale)</option>
                                            <option value="ORIGINAL_PRICE">Original Product Price (TYL Variant)</option>
                                            <option value="LIVE_SELLING_PRICE">Live Selling Price (Provider API)</option>
                                            <option value="CUSTOM">Custom Base Price</option>
                                        </Input>
                                        <small className="text-muted">Base price to apply markup on</small>
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    {formData.markupConfig.priceSource === "CUSTOM" && (
                                        <FormGroup>
                                            <Label>Custom Base Price <span className="text-danger">*</span></Label>
                                            <Input
                                                type="number"
                                                name="markupConfig.customPrice"
                                                value={formData.markupConfig.customPrice || ""}
                                                onChange={handleInputChange}
                                                min={0}
                                                step={0.01}
                                                placeholder="Enter custom price"
                                                required={formData.markupConfig.priceSource === "CUSTOM"}
                                            />
                                        </FormGroup>
                                    )}
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Markup Type <span className="text-danger">*</span></Label>
                                        <Input
                                            type="select"
                                            name="markupConfig.type"
                                            value={formData.markupConfig.type}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="NO_MARKUP">No Markup (Keep Original)</option>
                                            <option value="PERCENTAGE">Percentage Markup</option>
                                            <option value="FIXED_AMOUNT">Fixed Amount Markup</option>
                                            <option value="DISCOUNT">Discount</option>
                                            <option value="CUSTOM_PRICE">Custom Fixed Price</option>
                                            <option value="TIERED">Tiered (Advanced)</option>
                                        </Input>
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    {formData.markupConfig.type !== "NO_MARKUP" && formData.markupConfig.type !== "CUSTOM_PRICE" && (
                                        <FormGroup>
                                            <Label>
                                                {formData.markupConfig.type === "DISCOUNT" ? "Discount" : "Markup"} Value <span className="text-danger">*</span>
                                                {formData.markupConfig.type === "PERCENTAGE" && " (%)"}
                                                {formData.markupConfig.type === "DISCOUNT" && " (%)"}
                                                {formData.markupConfig.type === "FIXED_AMOUNT" && " (Fixed Amount)"}
                                            </Label>
                                            <Input
                                                type="number"
                                                name="markupConfig.value"
                                                value={formData.markupConfig.value || ""}
                                                onChange={handleInputChange}
                                                min={0}
                                                step={formData.markupConfig.type === "PERCENTAGE" || formData.markupConfig.type === "DISCOUNT" ? 1 : 0.01}
                                                required={formData.markupConfig.type !== "NO_MARKUP" && formData.markupConfig.type !== "CUSTOM_PRICE"}
                                            />
                                        </FormGroup>
                                    )}
                                    {formData.markupConfig.type === "CUSTOM_PRICE" && (
                                        <FormGroup>
                                            <Label>Custom Final Price <span className="text-danger">*</span></Label>
                                            <Input
                                                type="number"
                                                name="markupConfig.customPrice"
                                                value={formData.markupConfig.customPrice || ""}
                                                onChange={handleInputChange}
                                                min={0}
                                                step={0.01}
                                                required
                                            />
                                        </FormGroup>
                                    )}
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Currency</Label>
                                        <Input
                                            type="select"
                                            name="markupConfig.currency"
                                            value={formData.markupConfig.currency || "USD"}
                                            onChange={handleInputChange}
                                        >
                                            <option value="USD">USD - US Dollar</option>
                                            <option value="EUR">EUR - Euro</option>
                                            <option value="GBP">GBP - British Pound</option>
                                            <option value="INR">INR - Indian Rupee</option>
                                            <option value="SGD">SGD - Singapore Dollar</option>
                                            <option value="AUD">AUD - Australian Dollar</option>
                                            <option value="CAD">CAD - Canadian Dollar</option>
                                            <option value="JPY">JPY - Japanese Yen</option>
                                            <option value="AED">AED - UAE Dirham</option>
                                            <option value="SAR">SAR - Saudi Riyal</option>
                                        </Input>
                                        <small className="text-muted">
                                            Currency for fixed amount markup (important for FIXED_AMOUNT and CUSTOM_PRICE types)
                                        </small>
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Rounding Rule</Label>
                                        <Input
                                            type="select"
                                            name="markupConfig.roundingRule"
                                            value={formData.markupConfig.roundingRule || "NONE"}
                                            onChange={handleInputChange}
                                        >
                                            <option value="NONE">None</option>
                                            <option value="UP">Round Up</option>
                                            <option value="DOWN">Round Down</option>
                                            <option value="NEAREST">Round to Nearest</option>
                                            <option value="NEAREST_5">Round to Nearest 5</option>
                                            <option value="NEAREST_10">Round to Nearest 10</option>
                                        </Input>
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Min Price (Optional)</Label>
                                        <Input
                                            type="number"
                                            name="markupConfig.minPrice"
                                            value={formData.markupConfig.minPrice || ""}
                                            onChange={handleInputChange}
                                            min={0}
                                            step={0.01}
                                            placeholder="Minimum price"
                                        />
                                        <small className="text-muted">Enforce minimum price</small>
                                    </FormGroup>
                                </Col>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Max Price (Optional)</Label>
                                        <Input
                                            type="number"
                                            name="markupConfig.maxPrice"
                                            value={formData.markupConfig.maxPrice || ""}
                                            onChange={handleInputChange}
                                            min={0}
                                            step={0.01}
                                            placeholder="Maximum price"
                                        />
                                        <small className="text-muted">Enforce maximum price</small>
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <FormGroup check>
                                        <Input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                        />
                                        <Label check>Active</Label>
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup check>
                                        <Input
                                            type="checkbox"
                                            name="isDefault"
                                            checked={formData.isDefault}
                                            onChange={handleInputChange}
                                        />
                                        <Label check>Default Configuration</Label>
                                    </FormGroup>
                                </Col>
                            </Row>

                            {/* Preview Section */}
                            <Card className="mt-3">
                                <CardBody>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="mb-0">Price Preview</h6>
                                        <FormGroup className="mb-0" style={{ minWidth: '250px' }}>
                                            <Input
                                                type="select"
                                                value={selectedDisplayCurrency}
                                                onChange={(e) => setSelectedDisplayCurrency(e.target.value)}
                                            >
                                                {/* Default currencies - always visible */}
                                                <option value="USD">USD - US Dollar ($)</option>
                                                <option value="INR">INR - Indian Rupee (₹)</option>
                                                <option value="AED">AED - UAE Dirham (د.إ)</option>

                                                {/* Separator */}
                                                <option disabled>──────────────</option>

                                                {/* Other currencies */}
                                                {currencyList
                                                    .filter(c => !["USD", "INR", "AED"].includes(c.code))
                                                    .map((currency) => (
                                                        <option key={currency.code} value={currency.code}>
                                                            {currency.code} - {currency.name} ({currency.symbol})
                                                        </option>
                                                    ))}
                                            </Input>
                                        </FormGroup>
                                    </div>
                                    {actualPricing.loading && (
                                        <div className="text-center py-2">
                                            <Spinner size="sm" className="me-2" />
                                            <small className="text-muted">Loading actual prices...</small>
                                        </div>
                                    )}
                                    <p className="mb-1">
                                        <strong>Provider:</strong> {formData.provider ? getProviderDisplayName(formData.provider) : "—"}
                                    </p>
                                    <p className="mb-1">
                                        <strong>Base Price Source:</strong> {formData.markupConfig.priceSource || "B2B_PRICE"}
                                    </p>

                                    {/* Show warning if provider mappings not found */}
                                    {formData.provider && (selectedVariant || variantId) && actualPricing.b2bPrice && actualPricing.b2bPrice === actualPricing.originalPrice && actualPricing.b2bPrice > 0 && (
                                        <div className="mb-3 p-2 bg-warning bg-opacity-10 border border-warning rounded">
                                            <small className="text-warning">
                                                <strong>⚠️ Warning:</strong> Provider mappings may not be set up correctly.
                                                Showing variant's stored price ({getConvertedPrice(actualPricing.b2bPrice, selectedDisplayCurrency, actualPricing, true)}) instead of live provider B2B price.
                                                Please ensure provider mappings are active to see actual provider wholesale prices (e.g., $84.71, $76.28, $55.00).
                                            </small>
                                        </div>
                                    )}

                                    {/* Show actual prices side by side for comparison */}
                                    {(selectedVariant || variantId) && (actualPricing.b2bPrice !== null && actualPricing.b2bPrice > 0 || actualPricing.originalPrice !== null || actualPricing.liveSellingPrice !== null) && (
                                        <div className="mb-3 p-3 bg-light rounded">
                                            <h6 className="mb-2">Current Day's Actual Prices:</h6>
                                            <Row>
                                                {actualPricing.b2bPrice !== null && actualPricing.b2bPrice > 0 && (
                                                    <Col md={4}>
                                                        <div className="text-center p-2 border rounded">
                                                            <small className="text-muted d-block">B2B Price (Wholesale)</small>
                                                            <strong className="text-primary">{getConvertedPrice(actualPricing.b2bPrice, selectedDisplayCurrency, actualPricing, true)}</strong>
                                                            {actualPricing.liveSellingPrice === null && (
                                                                <small className="text-muted d-block mt-1">(Variant Base Price - may be outdated)</small>
                                                            )}
                                                        </div>
                                                    </Col>
                                                )}
                                                {actualPricing.originalPrice !== null && actualPricing.originalPrice > 0 && (
                                                    <Col md={4}>
                                                        <div className="text-center p-2 border rounded">
                                                            <small className="text-muted d-block">Original Price (TYL)</small>
                                                            <strong className="text-info">{actualPricing.currency || "USD"} {actualPricing.originalPrice.toFixed(2)}</strong>
                                                        </div>
                                                    </Col>
                                                )}
                                                {actualPricing.liveSellingPrice !== null && actualPricing.liveSellingPrice > 0 && (
                                                    <Col md={4}>
                                                        <div className="text-center p-2 border rounded">
                                                            <small className="text-muted d-block">Live Selling Price</small>
                                                            <strong className="text-warning">{actualPricing.currency || "USD"} {actualPricing.liveSellingPrice.toFixed(2)}</strong>
                                                        </div>
                                                    </Col>
                                                )}
                                            </Row>
                                        </div>
                                    )}

                                    {/* Show actual base price based on source */}
                                    {(() => {
                                        let basePrice = null;
                                        let basePriceLabel = "Base Price";
                                        let isFallbackPrice = false;

                                        if (formData.markupConfig.priceSource === "B2B_PRICE") {
                                            basePrice = actualPricing.b2bPrice;
                                            basePriceLabel = "Actual B2B Price (Provider Wholesale)";
                                            // If b2bPrice is from variant's base price (not from provider API), it's a fallback
                                            isFallbackPrice = actualPricing.b2bPrice !== null && actualPricing.liveSellingPrice === null;
                                        } else if (formData.markupConfig.priceSource === "ORIGINAL_PRICE") {
                                            basePrice = actualPricing.originalPrice;
                                            basePriceLabel = "Actual Original Price (TYL Variant)";
                                        } else if (formData.markupConfig.priceSource === "LIVE_SELLING_PRICE") {
                                            basePrice = actualPricing.liveSellingPrice;
                                            basePriceLabel = "Actual Live Selling Price (Provider API)";
                                        } else if (formData.markupConfig.priceSource === "CUSTOM") {
                                            basePrice = formData.markupConfig.customPrice;
                                            basePriceLabel = "Custom Base Price";
                                        }

                                        // Always show a price - use variant's base price if no other price is available
                                        if (basePrice === null || basePrice === undefined || basePrice <= 0) {
                                            basePrice = actualPricing.b2bPrice || actualPricing.originalPrice || 0;
                                            isFallbackPrice = true;
                                        }

                                        return (
                                            <p className="mb-1">
                                                <strong>{basePriceLabel}:</strong>{" "}
                                                {basePrice !== null && basePrice !== undefined && basePrice > 0 ? (
                                                    <span className="text-primary fw-bold">
                                                        {formData.markupConfig.currency || actualPricing.currency || "USD"} {basePrice.toFixed(2)}
                                                        {isFallbackPrice && (
                                                            <small className="text-muted ms-2">(Variant Base Price)</small>
                                                        )}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">
                                                        {selectedVariant || variantId ? "N/A (No price data available)" : "Select a variant to see actual price"}
                                                    </span>
                                                )}
                                            </p>
                                        );
                                    })()}

                                    {formData.markupConfig.priceSource === "CUSTOM" && (
                                        <p className="mb-1">
                                            <strong>Custom Base Price:</strong> {formData.markupConfig.currency || "USD"} {formData.markupConfig.customPrice?.toFixed(2) || "0.00"}
                                        </p>
                                    )}

                                    <p className="mb-1">
                                        <strong>Markup Type:</strong> {getMarkupTypeDisplayName(formData.markupConfig.type)}
                                    </p>
                                    {formData.markupConfig.type !== "NO_MARKUP" && formData.markupConfig.type !== "CUSTOM_PRICE" && (
                                        <p className="mb-1">
                                            <strong>Markup Value:</strong>{" "}
                                            {formData.markupConfig.type === "PERCENTAGE" || formData.markupConfig.type === "DISCOUNT" ? (
                                                <>{formData.markupConfig.value || 0}%</>
                                            ) : formData.markupConfig.type === "FIXED_AMOUNT" ? (
                                                <>{formData.markupConfig.currency || "USD"} {formData.markupConfig.value?.toFixed(2) || "0.00"}</>
                                            ) : (
                                                <>{formData.markupConfig.value || "—"}</>
                                            )}
                                        </p>
                                    )}
                                    {formData.markupConfig.type === "CUSTOM_PRICE" && (
                                        <p className="mb-1">
                                            <strong>Custom Final Price:</strong> {formData.markupConfig.currency || "USD"} {formData.markupConfig.customPrice?.toFixed(2) || "0.00"}
                                        </p>
                                    )}
                                    <div className="mb-2 p-2 bg-light rounded">
                                        <p className="mb-1">
                                            <strong>Calculated Final Price (B2C):</strong>{" "}
                                            <span className="text-success fw-bold fs-5">
                                                {(() => {
                                                    // Use actual base price if available, otherwise use example
                                                    let basePrice = 100; // Default example

                                                    if (formData.markupConfig.priceSource === "B2B_PRICE" && actualPricing.b2bPrice !== null) {
                                                        basePrice = actualPricing.b2bPrice;
                                                    } else if (formData.markupConfig.priceSource === "ORIGINAL_PRICE" && actualPricing.originalPrice !== null) {
                                                        basePrice = actualPricing.originalPrice;
                                                    } else if (formData.markupConfig.priceSource === "LIVE_SELLING_PRICE" && actualPricing.liveSellingPrice !== null) {
                                                        basePrice = actualPricing.liveSellingPrice;
                                                    } else if (formData.markupConfig.priceSource === "CUSTOM" && formData.markupConfig.customPrice) {
                                                        basePrice = formData.markupConfig.customPrice;
                                                    }

                                                    let finalPrice = basePrice;
                                                    let markupAmount = 0;

                                                    if (formData.markupConfig.type === "PERCENTAGE") {
                                                        markupAmount = basePrice * ((formData.markupConfig.value || 0) / 100);
                                                        finalPrice = basePrice + markupAmount;
                                                    } else if (formData.markupConfig.type === "FIXED_AMOUNT") {
                                                        markupAmount = formData.markupConfig.value || 0;
                                                        finalPrice = basePrice + markupAmount;
                                                    } else if (formData.markupConfig.type === "DISCOUNT") {
                                                        markupAmount = -(basePrice * ((formData.markupConfig.value || 0) / 100));
                                                        finalPrice = basePrice + markupAmount;
                                                    } else if (formData.markupConfig.type === "CUSTOM_PRICE") {
                                                        finalPrice = formData.markupConfig.customPrice || basePrice;
                                                        markupAmount = finalPrice - basePrice;
                                                    } else if (formData.markupConfig.type === "NO_MARKUP") {
                                                        finalPrice = basePrice;
                                                        markupAmount = 0;
                                                    }

                                                    const currency = formData.markupConfig.currency || actualPricing.currency || "USD";
                                                    const isActualPrice = (formData.markupConfig.priceSource === "B2B_PRICE" && actualPricing.b2bPrice !== null) ||
                                                        (formData.markupConfig.priceSource === "ORIGINAL_PRICE" && actualPricing.originalPrice !== null) ||
                                                        (formData.markupConfig.priceSource === "LIVE_SELLING_PRICE" && actualPricing.liveSellingPrice !== null) ||
                                                        (formData.markupConfig.priceSource === "CUSTOM" && formData.markupConfig.customPrice);

                                                    // Convert prices based on selected display currency
                                                    let displayFinalPrice = finalPrice;
                                                    let displayBasePrice = basePrice;
                                                    let displayMarkupAmount = markupAmount;
                                                    let displayCurrency = currency;
                                                    let displaySymbol = "$";

                                                    // Get currency info from list
                                                    const selectedCurrencyInfo = currencyList.find(c => c.code === selectedDisplayCurrency);

                                                    if (selectedCurrencyInfo) {
                                                        displayCurrency = selectedCurrencyInfo.code;
                                                        displaySymbol = selectedCurrencyInfo.symbol;

                                                        // Get conversion rate for selected currency
                                                        let conversionRate = 1;

                                                        // For default currencies, use cached rates
                                                        if (selectedDisplayCurrency === "INR" && actualPricing.inrRate) {
                                                            conversionRate = actualPricing.inrRate;
                                                        } else if (selectedDisplayCurrency === actualPricing.cityCurrency && actualPricing.cityRate) {
                                                            conversionRate = actualPricing.cityRate;
                                                        } else if (selectedDisplayCurrency !== "USD") {
                                                            // For other currencies, we'll need to fetch the rate
                                                            // For now, use approximate rates (can be enhanced to fetch from API)
                                                            const approximateRates = {
                                                                "EUR": 0.92, "GBP": 0.79, "SAR": 3.75, "QAR": 3.64, "KWD": 0.31,
                                                                "OMR": 0.38, "BHD": 0.38, "SGD": 1.34, "AUD": 1.52, "CAD": 1.35,
                                                                "JPY": 150, "CHF": 0.88, "CNY": 7.2, "HKD": 7.8, "THB": 35,
                                                                "MYR": 4.7, "IDR": 15500, "PHP": 55, "VND": 24500, "KRW": 1300,
                                                                "NZD": 1.65, "ZAR": 18.5, "BRL": 4.9, "MXN": 17, "ARS": 850,
                                                                "CLP": 900, "COP": 3900, "PEN": 3.7, "TRY": 32, "RUB": 90,
                                                                "ILS": 3.7, "EGP": 48, "JOD": 0.71, "LBP": 15000, "PKR": 280,
                                                                "BDT": 110, "LKR": 325, "NPR": 133, "MMK": 2100, "KHR": 4100, "LAK": 21000
                                                            };
                                                            conversionRate = approximateRates[selectedDisplayCurrency] || 1;
                                                        }

                                                        // Convert if needed
                                                        if (conversionRate !== 1) {
                                                            displayFinalPrice = finalPrice * conversionRate;
                                                            displayBasePrice = basePrice * conversionRate;
                                                            displayMarkupAmount = markupAmount * conversionRate;
                                                        }
                                                    }

                                                    return (
                                                        <>
                                                            <div className="mb-2">
                                                                <strong className="d-block mb-1 fs-4">{displaySymbol} {displayFinalPrice.toFixed(2)} ({displayCurrency})</strong>
                                                            </div>
                                                            {isActualPrice && (
                                                                <div className="d-block text-muted small mt-1 border-top pt-2">
                                                                    <small className="d-block">
                                                                        <strong>Breakdown:</strong> B2B: {displaySymbol} {displayBasePrice.toFixed(2)} + Markup: {displaySymbol} {displayMarkupAmount.toFixed(2)} = {displaySymbol} {displayFinalPrice.toFixed(2)}
                                                                    </small>
                                                                </div>
                                                            )}
                                                            {!isActualPrice && (selectedVariant || variantId) && (
                                                                <small className="text-muted ms-2 d-block">(Example - actual prices loading...)</small>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </span>
                                        </p>
                                    </div>
                                    {formData.markupConfig.type === "FIXED_AMOUNT" && (
                                        <p className="mb-1 text-muted">
                                            <small>
                                                <i className="mdi mdi-information-outline"></i> Fixed amount ({formData.markupConfig.currency || "USD"} {formData.markupConfig.value?.toFixed(2) || "0.00"}) is added to the base price.
                                            </small>
                                        </p>
                                    )}
                                    <p className="mb-0">
                                        <strong>Priority:</strong> {formData.priority} (Higher = evaluated first)
                                    </p>
                                </CardBody>
                            </Card>
                        </form>
                    </TabPane>
                </TabContent>
            </ModalBody>
            <ModalFooter>
                {activeTab === "form" && (
                    <>
                        <Button color="secondary" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            onClick={handleSubmit}
                            disabled={upsertingMarkupConfig || updatingMarkupConfig}
                        >
                            {upsertingMarkupConfig || updatingMarkupConfig ? (
                                <>
                                    <Spinner size="sm" className="me-1" />
                                    {editingConfig ? "Updating..." : "Saving..."}
                                </>
                            ) : (
                                <>{editingConfig ? "Update" : "Save"} Configuration</>
                            )}
                        </Button>
                    </>
                )}
                <Button color="secondary" onClick={toggle}>
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default MarkupConfigModal;
