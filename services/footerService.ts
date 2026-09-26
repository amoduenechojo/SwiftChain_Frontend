import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export interface FooterLink {
  id: string;
  label: string;
  href: string;
}

export interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
}

export interface FooterContent {
  sections: FooterSection[];
}

export const footerService = {
  async getFooterContent(): Promise<FooterContent> {
    const { data } = await axios.get<FooterContent>(
      `${API_BASE_URL}/api/footer`,
    );
    return data;
  },

  async subscribeToNewsletter(email: string): Promise<{ success: boolean }> {
    const { data } = await axios.post<{ success: boolean }>(
      `${API_BASE_URL}/api/footer/subscribe`,
      { email },
    );
    return data;
  },
};
