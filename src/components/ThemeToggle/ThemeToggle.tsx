import { LightMode, DarkMode } from "@mui/icons-material";
import { useThemeContext } from "@contexts";
import { Tooltip } from "@components";

const sunIcon = <LightMode fontSize="medium" className="text-yellow-400" />;
const moonIcon = <DarkMode fontSize="medium" className="text-blue-600" />;

export function ThemeToggle() {
  const { darkTheme, setToDarkTheme, setToLightTheme } = useThemeContext();

  const handleOnClick = (darkTheme: boolean) => {
    if (darkTheme) setToDarkTheme();
    else setToLightTheme();
  };

  const toggleIcon = darkTheme ? sunIcon : moonIcon;

  return (
    <Tooltip
      tooltipContent={darkTheme ? "Toggle Light Mode" : "Toggle Dark Mode"}
      tooltipPosition="left"
    >
      <a
        className="w-8 h-8 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 flex justify-center items-center rounded-md cursor-pointer"
        onClick={(e) => handleOnClick(!darkTheme)}
      >
        {toggleIcon}
      </a>
    </Tooltip>
  );
}
