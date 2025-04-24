import React, { useEffect, useState, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import atcCategories from "../data/atcCategories.json";

const Graph = () => {
  const [medicines, setMedicines] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [expandedGroups, setExpandedGroups] = useState({});
  const graphRef = useRef();
  const [hoveredNode, setHoveredNode] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetch("/data/fk_medicijnen.json")
      .then((res) => res.json())
      .then((data) => {
        setMedicines(data);
        setMedicines(data);
        const nodes = [];
        const links = [];

        const atcMap = {};
        atcCategories.forEach((cat) => {
          nodes.push({ id: cat.code, name: cat.name, type: "atc" });
          atcMap[cat.code] = cat.name;
        });

        const groupSet = new Set();

        data.forEach((med) => {
          const atcMain = med["ATC-code"].charAt(0);
          const group = med["Geneesmiddelgroep"];

          if (!groupSet.has(group)) {
            groupSet.add(group);
            const groupId = `${group}`;
            nodes.push({
              id: groupId,
              name: group,
              url: med["Geneesmiddelgroep-link"],
              type: "group",
              parent: atcMain,
            });
            links.push({ source: atcMain, target: groupId });
          }
        });

        setGraphData({ nodes, links });
      })
      .catch((error) => {
        console.error("Error loading JSON:", error);
      });
  }, []);

  const handleNodeClick = (node) => {
    if (node.type === "group") {
      setExpandedGroups((prev) => {
        const isOpen = !!prev[node.id];
        const newState = { ...prev };

        if (isOpen) {
          delete newState[node.id];
        } else {
          const meds = medicines.filter((m) => m["Geneesmiddelgroep"] === node.name);
          if (meds.length > 0) {
            newState[node.id] = meds;
          }
        }

        return newState;
      });
    } else if (node.type === "medicine" && node.url) {
      window.open(node.url, "_blank");
    }
  };

  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400);
    }

    const expandedNodes = [];
    const expandedLinks = [];

    Object.entries(expandedGroups).forEach(([group, meds]) => {
      meds.forEach((med) => {
        const id = `${group}-${med.Naam}`;
        expandedNodes.push({
          id,
          name: med.Naam,
          url: med.URL,
          indication: med.Indicatie,
          type: "medicine",
          parent: group,
        });
        expandedLinks.push({ source: group, target: id });
      });
    });

    setGraphData((prev) => ({
      nodes: [
        ...prev.nodes.filter((n) => n.type !== "medicine"),
        ...expandedNodes,
      ],
      links: [
        ...prev.links.filter((l) => typeof l.target === "string" && !l.target.includes("-")),
        ...expandedLinks,
      ],
    }));
  }, [expandedGroups]);

  return (
    <div className="w-full h-screen bg-white relative">
      <p className="text-blue-700 text-center mt-2">
        Find out which medicines are in our database!
      </p>

      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeLabel={(node) => `${node.name}`}
        nodeAutoColorBy="type"
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        onNodeClick={handleNodeClick}
        onNodeHover={(node) => setHoveredNode(node)}
        onMouseMove={(event) =>
          setMousePos({ x: event.clientX, y: event.clientY })
        }
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Questrial`;
          ctx.fillStyle =
            node.type === "atc" ? "#004aad" :
            node.type === "group" ? "#006dff" :
            node.type === "medicine" ? "#3aabfc" : "#000";
          ctx.beginPath();
          ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI);
          ctx.fill();
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(label, node.x, node.y + 6);

          // Maak tekst klikbaar voor groep-links
          if (node.type === "group" && node.url) {
            const textWidth = ctx.measureText(label).width;
            const textHeight = fontSize;
            const x = node.x - textWidth / 2;
            const y = node.y + 6;

            const mouseX = mousePos.x - graphRef.current?.offsetLeft;
            const mouseY = mousePos.y - graphRef.current?.offsetTop;

            if (
              mouseX >= x &&
              mouseX <= x + textWidth &&
              mouseY >= y &&
              mouseY <= y + textHeight
            ) {
              canvas.style.cursor = "pointer";
              canvas.onclick = () => window.open(node.url, "_blank");
            }
          }
        }}
      />

      {hoveredNode && hoveredNode.type === "medicine" && hoveredNode.Indicaties && (
        <div
          className="fixed z-50 bg-white border border-gray-300 shadow-lg rounded p-2 text-sm w-72"
          style={{
            top: mousePos.y + 10,
            left: mousePos.x + 10,
          }}
        >
          <p className="font-bold mb-1">{hoveredNode.name}</p>
          <p>{hoveredNode.Indicaties}</p>
        </div>
      )}
    </div>
  );
};

export default Graph;
