import React, { useState, createContext, useContext } from "react";
/*
    For future note: Contexts provide values of any type from a parent down to
    any children. In this case, this file creates the context, provides the
    context to children, and has a function that allows it children to use
    the context with `useAuth`. The usage of `ThemeContextProvider` is in
    App.jsx.
*/

type ChildrenProps = {
    children: React.ReactNode;
}

interface themeContext {
    darkTheme: boolean,
    setToDarkTheme: () => void,
    setToLightTheme: () => void,
    clearTheme: () => void
};

const ThemeContext = createContext<themeContext>({
    darkTheme: (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)),
    setToDarkTheme: () => {},
    setToLightTheme: () => {},
    clearTheme: () => {},
});

export const useThemeContext = () => {
    return useContext(ThemeContext);
};

export default function ThemeContextProvider(props: ChildrenProps) {
    const [darkTheme, setDarkTheme] = useState<boolean>(localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches));

    const setToDarkTheme = async () => {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
        setDarkTheme(true);
    };

    const setToLightTheme = async () => {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
        setDarkTheme(false);
    };

    const clearTheme = async () => {
        localStorage.removeItem('theme');
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            setDarkTheme(true);
        } else {
            document.documentElement.classList.remove('dark');
            setDarkTheme(false);
        }
    };

    const value: themeContext = {
        darkTheme,
        setToDarkTheme,
        setToLightTheme,
        clearTheme
    };

    return (
        <ThemeContext.Provider value={value}>
            {props.children}
        </ThemeContext.Provider>
    );
};