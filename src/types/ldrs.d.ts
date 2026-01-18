declare namespace JSX {
  interface IntrinsicElements {
    "l-metronome": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        size?: string;
        speed?: string;
        color?: string;
      },
      HTMLElement
    >;
  }
}
