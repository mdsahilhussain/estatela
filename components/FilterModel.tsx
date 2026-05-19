import { BEDS, PRICE_PRESETS, TYPES } from "@/constants/data";
import { icons } from "@/constants/icons";
import { useFilterStore } from "@/store/filterStore";
import clsx from "clsx";
import { useState } from "react";
import {
    Image,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";


const chip = (active: boolean) =>
    `px-4 py-2 rounded-full border-[.8px] ${active ? "bg-accent border-accent" : "bg-background border-border"
    }`;

const chipText = (active: boolean) =>
    `text-sm font-semibold ${active ? "text-background" : "text-foreground"}`;

export default function FilterModal({
    visible,
    onClose,
}: {
    visible: boolean;
    onClose: () => void;
}) {
    const {
        type,
        bedrooms,
        minPrice,
        maxPrice,
        setType,
        setBedrooms,
        setMinPrice,
        setMaxPrice,
        resetFilters,
    } = useFilterStore();

    const [localMin, setLocalMin] = useState<string>(minPrice ? String(minPrice) : "");
    const [localMax, setLocalMax] = useState<string>(maxPrice ? String(maxPrice) : "");

    const activeCount = [type, bedrooms, minPrice, maxPrice].filter(
        (v) => v !== null
    ).length;

    const handleApply = () => {
        setMinPrice(localMin ? Number(localMin) : null);
        setMaxPrice(localMax ? Number(localMax) : null);
        onClose();
    };

    const handleReset = () => {
        setLocalMin("");
        setLocalMax("");
        resetFilters();
        onClose();
    };

    const shadow = {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View className="filter-model-container">
                {/* Header */}
                <View className="filter-model-header-container">
                    <Pressable onPress={onClose} className="p-1">
                        <Image source={icons.close_foreground} alt="search icon" className="home-search-icon" />
                    </Pressable>
                    <Text className="filter-model-header-title">Filters</Text>
                    <Pressable onPress={handleReset}>
                        <Text className="filter-model-header-button">Reset</Text>
                    </Pressable>
                </View>

                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Property Type */}
                    <Text className="filter-model-item-title">
                        Property Type
                    </Text>
                    <View className="filter-model-item">
                        {TYPES.map((item) => (
                            <TouchableOpacity
                                key={String(item.value)}
                                onPress={() => setType(item.value)}
                                className={chip(type === item.value)}
                                style={shadow}
                            >
                                <Text className={chipText(type === item.value)}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Bedrooms */}
                    <Text className="filter-model-item-title">
                        Bedrooms
                    </Text>
                    <View className="filter-model-item">
                        {BEDS.map((item) => (
                            <TouchableOpacity
                                key={String(item.value)}
                                onPress={() => setBedrooms(item.value)}
                                className={clsx("flex-1 items-center py-3 rounded-2xl border", bedrooms === item.value
                                    ? "bg-accent border-accent"
                                    : "bg-background border-border"
                                )}
                                style={shadow}
                            >
                                <Text
                                    className={clsx("text-sm font-bold", bedrooms === item.value ? "text-background" : "text-border"
                                    )}
                                >
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Price Range */}
                    <Text className="filter-model-item-title">
                        Price Range (₹)
                    </Text>
                    <View className="filter-model-item">
                        {[
                            {
                                label: "Min Price",
                                value: localMin,
                                onChange: setLocalMin,
                                placeholder: "0",
                            },
                            {
                                label: "Max Price",
                                value: localMax,
                                onChange: setLocalMax,
                                placeholder: "Any",
                            },
                        ].map(({ label, value, onChange, placeholder }) => (
                            <View key={label} className="flex-1">
                                <Text className="filter-model-item-price-title">
                                    {label}
                                </Text>
                                <View
                                    className="filter-model-item-price"
                                    style={shadow}
                                >
                                    <Text className="text-foreground text-sm mr-1">₹</Text>
                                    <TextInput
                                        className="flex-1 py-3 text-foreground"
                                        placeholder={placeholder}
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="numeric"
                                        value={value}
                                        onChangeText={onChange}
                                    />
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Price Presets */}
                    <View className="filter-model-item">
                        {PRICE_PRESETS.map((p) => {
                            const active = minPrice === p.min && maxPrice === p.max;
                            return (
                                <Pressable
                                    key={p.label}
                                    onPress={() => {
                                        setLocalMin(p.min ? String(p.min) : "");
                                        setLocalMax(p.max ? String(p.max) : "");
                                        setMinPrice(p.min);
                                        setMaxPrice(p.max);
                                    }}
                                    className={clsx("px-3 py-1.5 rounded-full border", active
                                        ? "bg-accent/10 border-accent/30"
                                        : "bg-background border-border"
                                    )}
                                >
                                    <Text
                                        className={clsx("text-xs font-medium", active ? "text-accent" : "text-foreground"
                                        )}
                                        numberOfLines={1}
                                    >
                                        {p.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </ScrollView>

                {/* Apply Button */}
                <View className="px-5 pb-8 pt-4 bg-white border-t border-gray-100">
                    <TouchableOpacity
                        onPress={handleApply}
                        className="bg-accent rounded-2xl py-4 items-center"
                        style={{
                            shadowColor: "#2563EB",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 4,
                        }}
                    >
                        <Text className="text-background font-bold text-base">
                            Apply Filters{activeCount > 0 ? ` (${activeCount})` : ""}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}