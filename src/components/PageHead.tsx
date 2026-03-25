import { Helmet } from 'react-helmet-async';

interface Props {
  title: string;
  description?: string;
}

export default function PageHead({ title, description = 'Premium intercity bus booking in Bangladesh — Star Line Group' }: Props) {
  return (
    <Helmet>
      <title>{title} | Star Line Group</title>
      <meta name="description" content={description} />
    </Helmet>
  );
}
