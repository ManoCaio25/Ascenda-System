import React from "react";
import Layout from "@estagiario/layout";
import { I18nProvider } from "@estagiario/Components/utils/i18n";
import { AccessibilityProvider } from "@estagiario/Components/utils/accessibility";

export default function App({ children, currentPageName }) {
  return (
    <I18nProvider>
      <AccessibilityProvider>
        <Layout currentPageName={currentPageName}>
          {children}
        </Layout>
      </AccessibilityProvider>
    </I18nProvider>
  );
}
