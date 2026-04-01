import {
  eyeIcon,
} from "@excalidraw/excalidraw/components/icons";
import { MainMenu } from "@excalidraw/excalidraw/index";
import React from "react";
import { isDevEnv } from "@excalidraw/common";
import type { Theme } from "@excalidraw/element/types";
import { LanguageList } from "../app-language/LanguageList";
import { saveDebugState } from "./DebugCanvas";
export const AppMainMenu: React.FC<{
  onCollabDialogOpen: () => any;
  isCollaborating: boolean;
  isCollabEnabled: boolean;
  theme: Theme | "system";
  setTheme: (theme: Theme | "system") => void;
  refresh: () => void;
}> = React.memo((props) => {
  return (
    <MainMenu>
      <MainMenu.ItemCustom>
        <div style={{ padding: "8px 12px 4px" }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 564.41 89.1" style={{ height: 18, width: "auto", opacity: 0.9 }}>
            <style>{`.sm { fill: currentColor; }`}</style>
            <g>
              <path className="sm" d="M31.17,41.62l-9.79-2.1c-4.48-1.05-6.68-2.77-6.68-5.29,0-3.29,3.15-5.5,7.97-5.5,5.15,0,8.45,2.54,8.74,6.64h12.83c-.19-9.93-8.54-16.42-21.38-16.42S1.29,25.34,1.29,35.09c0,7.54,4.96,12.59,14.66,14.8l9.44,2.1c4.58,1.1,6.31,2.53,6.31,5.1,0,3.34-3.21,5.44-8.5,5.44s-8.92-2.48-9.54-6.77H0c.76,9.97,9.16,16.56,22.81,16.56s22.76-6.64,22.76-16.69c0-7.66-4.15-11.71-14.4-14Z"/>
              <path className="sm" d="M60.81,0c-3.95.16-7.02,3.49-6.86,7.44.16,3.95,3.49,7.02,7.44,6.86,3.83-.15,6.87-3.31,6.87-7.14C68.22,3.17,64.95-.04,60.96,0c-.05,0-.1,0-.15,0Z"/>
              <rect className="sm" x="53.82" y="20.05" width="13.94" height="51.17"/>
              <path className="sm" d="M106.93,41.62l-9.78-2.1c-4.48-1.05-6.68-2.77-6.68-5.29,0-3.29,3.15-5.5,7.97-5.5,5.15,0,8.44,2.54,8.73,6.64h12.84c-.19-9.93-8.54-16.42-21.38-16.42s-21.57,6.39-21.57,16.13c0,7.54,4.96,12.59,14.66,14.8l9.44,2.1c4.58,1.1,6.3,2.53,6.3,5.1,0,3.34-3.2,5.44-8.49,5.44s-8.92-2.48-9.54-6.77h-13.65c.76,9.97,9.16,16.56,22.81,16.56s22.76-6.64,22.76-16.69c0-7.66-4.15-11.71-14.42-14Z"/>
              <rect className="sm" x="129.57" y="20.05" width="13.94" height="51.17"/>
              <path className="sm" d="M136.55,0c-3.99-.13-7.32,3.01-7.45,7,0,.05,0,.11,0,.16-.16,4.11,3.04,7.58,7.15,7.74,4.11.16,7.58-3.04,7.74-7.15.16-4.11-3.04-7.58-7.15-7.74-.1,0-.19,0-.29,0Z"/>
            </g>
          </svg>
        </div>
      </MainMenu.ItemCustom>
      <MainMenu.Separator />
      <MainMenu.DefaultItems.SaveAsImage />
      {props.isCollabEnabled && (
        <MainMenu.DefaultItems.LiveCollaborationTrigger
          isCollaborating={props.isCollaborating}
          onSelect={() => props.onCollabDialogOpen()}
        />
      )}
      <MainMenu.DefaultItems.CommandPalette className="highlighted" />
      <MainMenu.DefaultItems.SearchMenu />
      <MainMenu.DefaultItems.Help />
      <MainMenu.DefaultItems.ClearCanvas />
      {isDevEnv() && (
        <>
          <MainMenu.Separator />
          <MainMenu.Item
            icon={eyeIcon}
            onSelect={() => {
              if (window.visualDebug) {
                delete window.visualDebug;
                saveDebugState({ enabled: false });
              } else {
                window.visualDebug = { data: [] };
                saveDebugState({ enabled: true });
              }
              props?.refresh();
            }}
          >
            Visual Debug
          </MainMenu.Item>
        </>
      )}
      <MainMenu.Separator />
      <MainMenu.DefaultItems.Preferences />
      <MainMenu.DefaultItems.ToggleTheme
        allowSystemTheme
        theme={props.theme}
        onSelect={props.setTheme}
      />
      <MainMenu.ItemCustom>
        <LanguageList style={{ width: "100%" }} />
      </MainMenu.ItemCustom>
      <MainMenu.DefaultItems.ChangeCanvasBackground />
    </MainMenu>
  );
});
