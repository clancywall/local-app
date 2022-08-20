import { Button, StyleSheet, TextInput } from "react-native";

import EditScreenInfo from "../components/EditScreenInfo";
import { Text, View } from "../components/Themed";
import { RootTabScreenProps } from "../types";

import React, { useState } from "react";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";

import RNDateTimePicker, { DateTimePickerAndroid, DateTimePickerEvent } from "@react-native-community/datetimepicker";

export default function TabOneScreen({ navigation }: RootTabScreenProps<"TabOne">) {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [bookingString, setbookingString] = useState("");
    const [unitNumber, setUnitNumberState] = useState('');
    const [licenceNumber, setLicenceNumberState] = useState('');

    const storeData = async (key: string, value: string) => {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (e) {
            // saving error
        }
    };

    const getData = async (key: string):Promise<string> => {
        try {
            const value = await AsyncStorage.getItem(key);
            if (value !== null) {
              return value;
            } else return '';
        } catch (e) {
          return '';
        }
    };

    const getUnitNumber = async () => {
      setUnitNumberState(await getData("@UnitNumber"));
    };

    const setUnitNumber = (value: any) => {
        storeData("@UnitNumber", value);
        setUnitNumberState(value);
    };

    const getLicenceNumber = async () => {
        setLicenceNumberState(await getData("@LicenceNumber"));
    };

    const setLicenceNumber = (value: any) => {
        storeData("@LicenceNumber", value);
        setLicenceNumberState(value);
    };

    getLicenceNumber();
    getUnitNumber();

    const td = (n: number): string => {
        return ("0" + n).slice(-2);
    };

    const formatDate = (date: Date): string => {
        const mo = td(date.getMonth() + 1);
        const d = td(date.getDate());
        const y = td(date.getFullYear());
        const h = td(((h = date.getHours()) => (h > 12 ? h - 12 : h === 0 ? 12 : h))());
        const p = ((h = date.getHours()) => (h > 12 ? "p" : "a"))();
        const mi = td(date.getMinutes());
        return `${d}/${mo}/${y} ${h}:${mi}${p}`;
    };

    const formatText = (start: Date, end: Date) => {
        if (start > end) setbookingString("");
        else setbookingString(`PSHARE ${unitNumber} ${licenceNumber} ${formatDate(start)} to ${formatDate(end)}`);
    };

    const copy = async () => {
        Clipboard.setStringAsync(bookingString);
        alert("Text copied: \n" + bookingString);
    };

    const onDateChange = (event: any, selectedDate: any, period: "start" | "end") => {
        showTimePicker(period, selectedDate);
    };

    const onTimeChange = (event: any, time: any, period: "start" | "end", date: Date) => {
        const hours = time.getHours();
        const minutes = time.getMinutes();
        const seconds = time.getSeconds();

        const newDate = date;
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        newDate.setSeconds(seconds);

        if (period === "start") {
            setStartDate(newDate);
            formatText(newDate, endDate);
        } else {
            setEndDate(newDate);
            formatText(startDate, newDate);
        }
    };

    const showTimePicker = (period: "start" | "end", selectedDate: Date) => {
        DateTimePickerAndroid.open({
            value: period === "start" ? startDate : endDate,
            onChange: (event, date) => onTimeChange(event, date, period, selectedDate),
            mode: "time",
            is24Hour: false,
        });
    };

    const showDatePicker = (period: "start" | "end") => {
        DateTimePickerAndroid.open({
            value: period === "start" ? startDate : endDate,
            onChange: (event, date) => onDateChange(event, date, period),
            mode: "date",
            minimumDate: period === "start" ? new Date() : startDate,
        });
    };

    const showStartPicker = () => {
        showDatePicker("start");
    };

    const showEndPicker = () => {
        showDatePicker("end");
    };

    return (
        <View style={styles.container}>
            <Text style={{ textAlign: "center" }}>Unit Number</Text>
            <TextInput
                style={{ textAlign: "center", backgroundColor: "white", fontWeight: "bold", minWidth: 100 }}
                defaultValue={unitNumber}
                onChangeText={(text) => setUnitNumber(text)}
            />
            <Text>{"\n"}</Text>
            <Text style={{ textAlign: "center" }}>Licence Number</Text>
            <TextInput
                style={{ textAlign: "center", backgroundColor: "white", fontWeight: "bold", minWidth: 100 }}
                defaultValue={licenceNumber}
                onChangeText={(text) => setLicenceNumber(text)}
            />
            <Text>{"\n"}</Text>
            <Button onPress={showStartPicker} title="Start Time" />
            <Text>{"\n"}</Text>
            <Button onPress={showEndPicker} title="End Time" />
            <Text style={{ textAlign: "center" }}>
                {"\n"}
                {bookingString}
                {"\n"}
            </Text>
            <Button onPress={copy} title="Copy" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: "80%",
    },
});
