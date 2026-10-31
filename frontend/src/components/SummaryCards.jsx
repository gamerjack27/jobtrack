function SummaryCards({ applications }) {
  const applied = applications.filter((app) => app.status !== "WISHLIST").length;
  const interviewing = applications.filter((app) => app.status === "INTERVIEWING").length;
  const offers = applications.filter((app) => app.status === "OFFERED").length;

  const cards = [
    { label: "Applied", value: applied },
    { label: "Interviewing", value: interviewing },
    { label: "Offers", value: offers },
  ];

  return (
    <section aria-label="Summary" className="grid grid-cols-3 gap-4 mb-6">
      {cards.map((card) => (
        <div key={card.label} className="border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className="text-2xl font-semibold">{card.value}</p>
        </div>
      ))}
    </section>
  );
}

export default SummaryCards;