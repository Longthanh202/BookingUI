import React, { useState } from "react";
import { usePopularDestinations, usePopularTags } from "../../../../hooks/useCustomerQueries";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import "../../../../styles/components/customer/home/PopularDestinationList.css";

const PopularDestinationList = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { data: tags = [], isLoading: tagsLoading } = usePopularTags();
  const { data: destinations = [], isFetching } = usePopularDestinations(selectedTag);

  const isLoading = tagsLoading;

  return (
    <div className="popular-destinations">
      <h3 className="popular-destinations__title">Địa điểm thịnh hành</h3>

      <div className="popular-destinations__filters">
        <Button
          variant={!selectedTag ? "primary" : "outline-secondary"}
          size="sm"
          onClick={() => setSelectedTag(null)}
        >
          Tất cả
        </Button>
        {tags.map((tag) => (
          <Button
            key={tag.id}
            variant={selectedTag === tag.name ? "primary" : "outline-secondary"}
            size="sm"
            onClick={() => setSelectedTag(tag.name)}
          >
            {tag.name}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-4">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          {isFetching && (
            <div className="mb-3 text-center">
              <Spinner animation="border" size="sm" /> Đang cập nhật...
            </div>
          )}
          <Row className="g-4">
            {destinations.map((destination: any) => (
              <Col key={destination.id} xs={12} sm={6} lg={4}>
                <Card className="popular-destinations__card">
                  <Card.Img
                    variant="top"
                    src={destination.image}
                    alt={destination.name}
                    style={{ height: 160, objectFit: "cover" }}
                  />
                  <Card.Body>
                    <Card.Title style={{ fontSize: 18, marginBottom: 8 }}>{destination.name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">{destination.region}</Card.Subtitle>
                    <Card.Text className="text-muted" style={{ marginTop: 12 }}>
                      {destination.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </div>
  );
};

export default PopularDestinationList;
