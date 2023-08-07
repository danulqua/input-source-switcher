import {
  Action,
  ActionPanel,
  Application,
  Clipboard,
  Form,
  Icon,
  Image,
  getFrontmostApplication,
  showHUD,
} from "@raycast/api";
import { useEffect, useState } from "react";
import { transformText } from "./utils/transformText";
import { Language } from "./data";

export default function main() {
  const [frontmostApp, setFrontmostApp] = useState<Application | null>(null);
  const [text, setText] = useState<string>("");
  const [langFrom, setLangFrom] = useState<Language>("eng");
  const [langTo, setLangTo] = useState<Language>("ukr");

  const [textError, setTextError] = useState<string | undefined>("");
  const [langError, setLangError] = useState<string | undefined>("");

  useEffect(() => {
    async function getFrontmostApp() {
      const app = await getFrontmostApplication();
      setFrontmostApp(app);
    }

    getFrontmostApp();
  }, []);

  const pasteToAppTitle = `Paste to ${frontmostApp ? frontmostApp.name : 'Active App'}`;
  const pasteToAppIcon: Image.ImageLike = frontmostApp ? { fileIcon: frontmostApp.path } : Icon.ArrowUp;

  async function handlePaste(text: string) {
    if (text.length === 0) {
      setTextError("Text is required");
      return;
    }

    const transformedText = transformText({ input: text, langFrom, langTo });
    await Clipboard.paste(transformedText);
    await showHUD("Transformed text pasted to active app");
  }

  async function handleCopy(text: string) {
    if (text.length === 0) {
      setTextError("Text is required");
      return;
    }

    const transformedText = transformText({ input: text, langFrom, langTo });
    await Clipboard.copy(transformedText);
    await showHUD("Transformed text copied to clipboard");
  }

  function handleSwitchLanguages() {
    const [langFromCopy, langToCopy] = [langTo, langFrom];

    setLangFrom(langFromCopy);
    setLangTo(langToCopy);
  }

  function onChangeText(text: string) {
    setText(text);
    dropTextErrorIfNeeded();
  }

  function onChangeLangFrom(lang: Language) {
    setLangFrom(lang);
    dropLangErrorIfNeeded();
  }

  function onChangeLangTo(lang: Language) {
    setLangTo(lang);
    dropLangErrorIfNeeded();
  }

  function dropTextErrorIfNeeded() {
    if (textError && textError.length > 0) {
      setTextError(undefined);
    }
  }

  function dropLangErrorIfNeeded() {
    if (langError && langError.length > 0) {
      setLangError(undefined);
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.SubmitForm
              title={pasteToAppTitle}
              icon={pasteToAppIcon}
              onSubmit={() => handlePaste(text)}
            />
            <Action.SubmitForm
              title="Copy to Clipboard"
              icon={Icon.CopyClipboard}
              shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }}
              onSubmit={() => handleCopy(text)}
            />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <Action.SubmitForm
              title="Switch Languages"
              icon={Icon.Switch}
              shortcut={{ modifiers: ["cmd", "shift"], key: "s" }}
              onSubmit={handleSwitchLanguages}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="text"
        title="Text"
        placeholder="Enter text here"
        value={text}
        error={textError}
        onChange={onChangeText}
        onBlur={(event) => {
          if (event.target.value?.length === 0) {
            setTextError("Text is required");
          } else {
            dropTextErrorIfNeeded();
          }
        }}
      />

      <Form.Dropdown
        id="langFrom"
        title="Language from"
        value={langFrom}
        error={langError}
        onChange={(lang: string) => onChangeLangFrom(lang as Language)}
        onBlur={(event) => {
          if (event.target.value === langTo) {
            setLangError("Languages should be different");
          } else {
            dropLangErrorIfNeeded();
          }
        }}
      >
        <Form.Dropdown.Item value="eng" title="🇬🇧 English" />
        <Form.Dropdown.Item value="ukr" title="🇺🇦 Ukrainian" />
      </Form.Dropdown>

      <Form.Dropdown
        id="langTo"
        title="Language to"
        value={langTo}
        error={langError}
        onChange={(lang: string) => onChangeLangTo(lang as Language)}
        onBlur={(event) => {
          if (event.target.value === langFrom) {
            setLangError("Languages should be different");
          } else {
            dropLangErrorIfNeeded();
          }
        }}
      >
        <Form.Dropdown.Item value="eng" title="🇬🇧 English" />
        <Form.Dropdown.Item value="ukr" title="🇺🇦 Ukrainian" />
      </Form.Dropdown>
    </Form>
  );
}
